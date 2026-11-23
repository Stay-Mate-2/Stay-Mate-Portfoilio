/**
 * StayMate Early Access Registration System — Google Apps Script Backend
 * ---------------------------------------------------------------------
 * Hosts authenticated registration intake, duplicate & concurrency protection,
 * marketing consent withdrawal, branded HTML email automation via MailApp, and
 * private Google Sheets storage (`StayMate_Early_Access_Database` -> `Registrations`).
 *
 * REQUIRED SCRIPT PROPERTIES (Project Settings -> Script Properties):
 *   - SPREADSHEET_ID : Google Sheet ID for StayMate_Early_Access_Database
 *   - ADMIN_EMAIL    : Destination email for internal registration notifications
 *   - SHARED_SECRET  : >= 32-character cryptographically random secret shared with Vercel
 *
 * SECURITY NOTES:
 *   - Never log PII (names, emails, cities), raw envelopes, signatures, or SHARED_SECRET.
 *   - Web App MUST be deployed as: Execute as "Me", Who has access "Anyone"
 *     (anonymous HTTP access is protected cryptographically by HMAC-SHA256 + timestamp + nonce).
 *   - CacheService nonces mitigate short-window replay within the 5-minute TTL,
 *     but CacheService is not a durable globally transactional store.
 */

var SHEET_NAME = "Registrations";
var ALLOWED_USER_TYPES = ["Student", "Working Professional", "Property Owner"];
var REGISTRATIONS_HEADERS = [
  "Registration_ID",
  "Full_Name",
  "Email",
  "User_Type",
  "Preferred_City",
  "Marketing_Consent",
  "Consent_Timestamp",
  "Registered_At",
  "Registration_Status",
  "Confirmation_Email_Status",
  "Admin_Notification_Status",
  "Source",
];

var MAX_ENVELOPE_BYTES = 8192;
var MAX_DATA_LENGTH = 4096;
var MAX_REQUEST_AGE_MS = 5 * 60 * 1000; // 5 minutes
var MAX_FUTURE_SKEW_MS = 30 * 1000; // 30 seconds
var NONCE_CACHE_TTL_SEC = 360; // 6 minutes (> MAX_REQUEST_AGE_MS)
var LOCK_TIMEOUT_MS = 15000;

/* ==========================================================================
   Menu & Database Initialization (Authorized Owner / Script Editor Only)
   ========================================================================== */

/**
 * Adds a restricted admin menu when an authorized editor opens the spreadsheet.
 */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("StayMate Admin")
      .addItem("Initialize Database", "initializeDatabase")
      .addItem("Retry Failed Emails", "retryFailedEmails")
      .addItem("Check Setup Status", "checkSetupStatus")
      .addToUi();
  } catch (err) {
    Logger.log("STAYMATE_UI_SKIP: " + safeErrorCode_(err));
  }
}

/**
 * Validates required Script Properties and initializes the `Registrations` sheet
 * safely without overwriting existing rows or valid headers.
 */
function initializeDatabase() {
  var cfg = getConfig_(true);
  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sheet = ensureRegistrationsSheet_(ss);

  Logger.log(
    JSON.stringify({
      event: "DATABASE_INITIALIZED",
      sheet: sheet.getName(),
      rows: sheet.getLastRow(),
    })
  );

  return {
    ok: true,
    spreadsheetName: ss.getName(),
    sheetName: sheet.getName(),
    existingRows: Math.max(0, sheet.getLastRow() - 1),
  };
}

/**
 * Non-destructive setup diagnostic runnable by an authorized script owner.
 * Outputs configuration readiness without printing any secrets or PII.
 */
function checkSetupStatus() {
  var cfg = getConfig_(true);
  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var summary = {
    ok: true,
    hasSpreadsheet: Boolean(ss),
    hasRegistrationsSheet: Boolean(sheet),
    remainingDailyEmailQuota: MailApp.getRemainingDailyQuota(),
    sharedSecretLength: cfg.sharedSecret.length,
    hasAdminEmail: Boolean(cfg.adminEmail),
  };
  Logger.log(JSON.stringify({ event: "SETUP_CHECK", summary: summary }));
  return summary;
}

/* ==========================================================================
   HTTP Web App Entrypoints
   ========================================================================== */

/**
 * Rejects browser/direct GET requests safely without exposing records or config.
 */
function doGet() {
  return jsonOutput_({
    ok: false,
    status: "error",
    code: "METHOD_NOT_ALLOWED",
    message: "POST requests signed by the StayMate backend are required.",
  });
}

/**
 * Authenticated entrypoint for signed StayMate Vercel requests.
 * Supports action "register" (default) and "withdraw_consent".
 */
function doPost(e) {
  var lock = null;
  var lockAcquired = false;

  try {
    if (!e || !e.postData || typeof e.postData.contents !== "string") {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "INVALID_REQUEST",
        message: "Missing request body.",
      });
    }

    var rawBody = e.postData.contents;
    if (!rawBody || rawBody.length > MAX_ENVELOPE_BYTES) {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "PAYLOAD_TOO_LARGE",
        message: "Request body exceeds allowed size.",
      });
    }

    var envelope;
    try {
      envelope = JSON.parse(rawBody);
    } catch (parseErr) {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "INVALID_JSON",
        message: "Malformed JSON envelope.",
      });
    }

    var cfg = getConfig_(false);
    if (!cfg) {
      Logger.log(JSON.stringify({ event: "CONFIG_ERROR", code: "MISSING_SCRIPT_PROPERTIES" }));
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "SERVER_MISCONFIGURED",
        message: "Service configuration is incomplete.",
      });
    }

    var authCheck = verifySignedEnvelope_(envelope, cfg.sharedSecret);
    if (!authCheck.ok) {
      Logger.log(JSON.stringify({ event: "AUTH_REJECTED", code: authCheck.code }));
      return jsonOutput_({
        ok: false,
        status: "error",
        code: authCheck.code,
        message: authCheck.message,
      });
    }

    var payload;
    try {
      payload = JSON.parse(envelope.data);
    } catch (dataErr) {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "INVALID_DATA_JSON",
        message: "Signed data payload must be valid JSON.",
      });
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "INVALID_DATA_SHAPE",
        message: "Signed data payload must be a JSON object.",
      });
    }

    lock = LockService.getScriptLock();
    lockAcquired = lock.tryLock(LOCK_TIMEOUT_MS);
    if (!lockAcquired) {
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "SERVICE_BUSY",
        message: "Could not acquire processing lock. Please retry shortly.",
      });
    }

    // Replay defense: short-window nonce reservation inside script lock
    var nonceKey = "staymate_nonce_" + String(envelope.nonce).toLowerCase();
    var cache = CacheService.getScriptCache();
    if (cache.get(nonceKey) !== null) {
      Logger.log(JSON.stringify({ event: "REPLAY_BLOCKED", code: "REPLAYED_NONCE" }));
      return jsonOutput_({
        ok: false,
        status: "error",
        code: "REPLAYED_NONCE",
        message: "Duplicate security nonce rejected.",
      });
    }
    cache.put(nonceKey, "1", NONCE_CACHE_TTL_SEC);

    var action = typeof payload.action === "string" ? payload.action : "register";
    if (action === "register") {
      return jsonOutput_(handleRegistration_(payload, cfg));
    }
    if (action === "withdraw_consent") {
      return jsonOutput_(handleConsentWithdrawal_(payload, cfg));
    }

    return jsonOutput_({
      ok: false,
      status: "error",
      code: "INVALID_ACTION",
      message: "Unsupported operation.",
    });
  } catch (err) {
    Logger.log(JSON.stringify({ event: "UNHANDLED_ERROR", code: safeErrorCode_(err) }));
    return jsonOutput_({
      ok: false,
      status: "error",
      code: "INTERNAL_ERROR",
      message: "Unable to process request safely.",
    });
  } finally {
    if (lock && lockAcquired) {
      try {
        lock.releaseLock();
      } catch (releaseErr) {
        /* Lock already expired cleanly */
      }
    }
  }
}

/* ==========================================================================
   Registration & Consent Handlers (Executed Under LockService)
   ========================================================================== */

function handleRegistration_(payload, cfg) {
  var validated = validateRegistrationPayload_(payload);
  if (!validated.ok) {
    return {
      ok: false,
      status: "error",
      code: "VALIDATION_ERROR",
      message: validated.message,
    };
  }

  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sheet = ensureRegistrationsSheet_(ss);

  // Check duplicate email case-insensitively before appending or emailing
  var existingRow = findRowByEmail_(sheet, validated.data.email);
  if (existingRow !== -1) {
    Logger.log(JSON.stringify({ event: "DUPLICATE_REGISTRATION", status: "duplicate" }));
    return {
      ok: true,
      status: "duplicate",
      code: "ALREADY_REGISTERED",
      message: "This email is already registered with StayMate.",
    };
  }

  var now = new Date();
  var nowIso = now.toISOString();
  var registrationId = generateRegistrationId_();
  var marketingConsent = validated.data.marketingConsent === true;
  var consentTimestamp = marketingConsent ? nowIso : "";

  var rowValues = [
    registrationId,
    sanitizeSpreadsheetCell_(validated.data.name),
    sanitizeSpreadsheetCell_(validated.data.email),
    sanitizeSpreadsheetCell_(validated.data.userType),
    sanitizeSpreadsheetCell_(validated.data.city),
    marketingConsent,
    consentTimestamp,
    nowIso,
    "REGISTERED",
    "PENDING",
    "PENDING",
    sanitizeSpreadsheetCell_(validated.data.source),
  ];

  // Append record BEFORE dispatching emails so failed mail never drops a user registration
  var targetRow = sheet.getLastRow() + 1;
  var rowRange = sheet.getRange(targetRow, 1, 1, REGISTRATIONS_HEADERS.length);
  sheet.getRange(targetRow, 1, 1, 5).setNumberFormat("@");
  sheet.getRange(targetRow, 7, 1, 6).setNumberFormat("@");
  rowRange.setValues([rowValues]);
  SpreadsheetApp.flush();

  var emailRecord = {
    registrationId: registrationId,
    name: validated.data.name,
    email: validated.data.email,
    userType: validated.data.userType,
    city: validated.data.city,
    marketingConsent: marketingConsent,
    consentTimestamp: consentTimestamp,
    registeredAtIso: nowIso,
  };

  var confirmationStatus = dispatchUserConfirmationEmail_(emailRecord);
  var adminStatus = dispatchAdminNotificationEmail_(emailRecord, cfg.adminEmail);

  sheet.getRange(targetRow, 10, 1, 2).setValues([[confirmationStatus, adminStatus]]);
  SpreadsheetApp.flush();

  Logger.log(
    JSON.stringify({
      event: "REGISTRATION_STORED",
      confirmationStatus: confirmationStatus,
      adminStatus: adminStatus,
    })
  );

  return {
    ok: true,
    status: "registered",
    code: "REGISTERED",
    registrationId: registrationId,
    confirmationEmailStatus: confirmationStatus,
    adminNotificationStatus: adminStatus,
    message: "You're on the list! Your StayMate early-access registration has been successfully received.",
  };
}

function handleConsentWithdrawal_(payload, cfg) {
  var email = normalizeEmail_(payload.email);
  if (!isValidEmail_(email)) {
    return {
      ok: false,
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Invalid email address.",
    };
  }

  var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  var sheet = ensureRegistrationsSheet_(ss);
  var rowIdx = findRowByEmail_(sheet, email);

  if (rowIdx !== -1) {
    var withdrawnStamp = "Withdrawn " + new Date().toISOString();
    sheet.getRange(rowIdx, 6).setValue(false);
    sheet.getRange(rowIdx, 7).setNumberFormat("@").setValue(withdrawnStamp);
    SpreadsheetApp.flush();
    Logger.log(JSON.stringify({ event: "CONSENT_WITHDRAWN", updated: true }));
  } else {
    Logger.log(JSON.stringify({ event: "CONSENT_WITHDRAW_CHECKED", updated: false }));
  }

  // Non-enumerating generic response regardless of email presence
  return {
    ok: true,
    status: "processed",
    code: "CONSENT_WITHDRAWAL_PROCESSED",
    message: "If that email is on the list, marketing consent has been withdrawn.",
  };
}

/* ==========================================================================
   Authorized Admin Retry Mechanism (Script Editor / Menu / Time Trigger Only)
   ========================================================================== */

/**
 * Safely retries any FAILED or PENDING confirmation/admin emails without
 * sending duplicate notifications for already SENT records.
 * Restricted exclusively to authorized Google Apps Script owners/triggers.
 */
function retryFailedEmails() {
  var cfg = getConfig_(true);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    throw new Error("Could not acquire script lock for email retry.");
  }

  try {
    var ss = SpreadsheetApp.openById(cfg.spreadsheetId);
    var sheet = ensureRegistrationsSheet_(ss);
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log(JSON.stringify({ event: "RETRY_SKIPPED", reason: "NO_RECORDS" }));
      return { attempted: 0, sent: 0, failed: 0 };
    }

    var data = sheet.getRange(2, 1, lastRow - 1, REGISTRATIONS_HEADERS.length).getValues();
    var attempted = 0;
    var sent = 0;
    var failed = 0;

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var confStatus = String(row[9] || "").trim().toUpperCase();
      var adminStatus = String(row[10] || "").trim().toUpperCase();
      var needsUser = confStatus === "FAILED" || confStatus === "PENDING";
      var needsAdmin = adminStatus === "FAILED" || adminStatus === "PENDING";

      if (!needsUser && !needsAdmin) continue;
      if (MailApp.getRemainingDailyQuota() <= 0) {
        Logger.log(JSON.stringify({ event: "RETRY_PAUSED_QUOTA_EXHAUSTED" }));
        break;
      }

      var emailRecord = {
        registrationId: unquoteCell_(row[0]),
        name: unquoteCell_(row[1]),
        email: normalizeEmail_(unquoteCell_(row[2])),
        userType: unquoteCell_(row[3]),
        city: unquoteCell_(row[4]),
        marketingConsent: row[5] === true || String(row[5]).toLowerCase() === "true",
        consentTimestamp: row[6] instanceof Date ? row[6].toISOString() : unquoteCell_(row[6]),
        registeredAtIso: row[7] instanceof Date ? row[7].toISOString() : unquoteCell_(row[7]),
      };

      var nextConf = confStatus;
      var nextAdmin = adminStatus;

      if (needsUser && isValidEmail_(emailRecord.email)) {
        attempted++;
        nextConf = dispatchUserConfirmationEmail_(emailRecord);
        if (nextConf === "SENT") sent++;
        else failed++;
      }

      if (needsAdmin && MailApp.getRemainingDailyQuota() > 0) {
        attempted++;
        nextAdmin = dispatchAdminNotificationEmail_(emailRecord, cfg.adminEmail);
        if (nextAdmin === "SENT") sent++;
        else failed++;
      }

      sheet.getRange(i + 2, 10, 1, 2).setValues([[nextConf, nextAdmin]]);
      Utilities.sleep(150);
    }

    SpreadsheetApp.flush();
    var summary = { event: "RETRY_COMPLETED", attempted: attempted, sent: sent, failed: failed };
    Logger.log(JSON.stringify(summary));
    return summary;
  } finally {
    lock.releaseLock();
  }
}

/* ==========================================================================
   Security: HMAC-SHA256 Verification, Timestamps & Input Validation
   ========================================================================== */

function verifySignedEnvelope_(envelope, sharedSecret) {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    return { ok: false, code: "AUTH_INVALID_ENVELOPE", message: "Invalid envelope structure." };
  }

  var timestampStr = envelope.timestamp;
  var nonce = envelope.nonce;
  var dataStr = envelope.data;
  var signature = envelope.signature;

  if (
    typeof timestampStr !== "string" ||
    typeof nonce !== "string" ||
    typeof dataStr !== "string" ||
    typeof signature !== "string"
  ) {
    return { ok: false, code: "AUTH_MISSING_FIELDS", message: "Authentication fields missing." };
  }

  if (!/^\d{10,16}$/.test(timestampStr)) {
    return { ok: false, code: "AUTH_INVALID_TIMESTAMP", message: "Invalid timestamp format." };
  }

  var tsMs = Number(timestampStr);
  var nowMs = Date.now();
  if (!isFinite(tsMs)) {
    return { ok: false, code: "AUTH_INVALID_TIMESTAMP", message: "Invalid timestamp value." };
  }
  if (nowMs - tsMs > MAX_REQUEST_AGE_MS) {
    return { ok: false, code: "REQUEST_EXPIRED", message: "Request signature has expired." };
  }
  if (tsMs - nowMs > MAX_FUTURE_SKEW_MS) {
    return { ok: false, code: "INVALID_FUTURE_TIMESTAMP", message: "Timestamp exceeds allowed clock skew." };
  }

  if (!/^[0-9a-f]{32,128}$/i.test(nonce)) {
    return { ok: false, code: "AUTH_INVALID_NONCE", message: "Invalid security nonce format." };
  }

  if (dataStr.length === 0 || dataStr.length > MAX_DATA_LENGTH) {
    return { ok: false, code: "AUTH_INVALID_DATA_SIZE", message: "Invalid payload size." };
  }

  if (!/^[0-9a-f]{64}$/i.test(signature)) {
    return { ok: false, code: "INVALID_SIGNATURE", message: "Invalid HMAC signature format." };
  }

  var signingMessage = timestampStr + "." + nonce + "." + dataStr;
  var hmacBytes = Utilities.computeHmacSha256Signature(
    signingMessage,
    sharedSecret,
    Utilities.Charset.UTF_8
  );
  var expectedHex = bytesToHex_(hmacBytes);

  if (!constantTimeEqualHex_(expectedHex, signature.toLowerCase())) {
    return { ok: false, code: "INVALID_SIGNATURE", message: "HMAC signature verification failed." };
  }

  return { ok: true };
}

function bytesToHex_(bytes) {
  var hex = [];
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    var v = b < 0 ? b + 256 : b;
    hex.push(("0" + v.toString(16)).slice(-2));
  }
  return hex.join("");
}

function constantTimeEqualHex_(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  var len = Math.max(a.length, b.length);
  if (len === 0) return false;
  var diff = a.length ^ b.length;
  for (var i = 0; i < len; i++) {
    var ca = i < a.length ? a.charCodeAt(i) : 0;
    var cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

function validateRegistrationPayload_(payload) {
  var rawName = typeof payload.name === "string" ? cleanSingleLine_(payload.name) : "";
  if (rawName.length < 2 || rawName.length > 80) {
    return { ok: false, message: "Full name must be between 2 and 80 characters." };
  }

  var normalizedEmail = normalizeEmail_(payload.email);
  if (!isValidEmail_(normalizedEmail)) {
    return { ok: false, message: "A valid email address is required." };
  }

  var userType = typeof payload.userType === "string" ? payload.userType.trim() : "";
  if (ALLOWED_USER_TYPES.indexOf(userType) === -1) {
    return { ok: false, message: "Invalid user category." };
  }

  var city = "";
  if (payload.city !== undefined && payload.city !== null) {
    if (typeof payload.city !== "string") {
      return { ok: false, message: "Preferred city must be text." };
    }
    city = cleanSingleLine_(payload.city);
    if (city.length > 60) {
      return { ok: false, message: "Preferred city must be 60 characters or fewer." };
    }
  }

  if (payload.consent !== true) {
    return { ok: false, message: "Explicit registration consent is required." };
  }

  if (
    payload.marketingConsent !== undefined &&
    typeof payload.marketingConsent !== "boolean"
  ) {
    return { ok: false, message: "Marketing consent must be a boolean." };
  }

  var source = typeof payload.source === "string" ? cleanSingleLine_(payload.source) : "staymate-website";
  if (!source || source.length > 50) source = "staymate-website";

  return {
    ok: true,
    data: {
      name: rawName,
      email: normalizedEmail,
      userType: userType,
      city: city,
      marketingConsent: payload.marketingConsent === true,
      source: source,
    },
  };
}

function cleanSingleLine_(str) {
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEmail_(value) {
  if (typeof value !== "string") return "";
  return cleanSingleLine_(value).toLowerCase();
}

function isValidEmail_(email) {
  if (!email || email.length < 3 || email.length > 254) return false;
  if (/[\s<>()\\,;:\[\]"]/.test(email)) return false;
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email);
}

function sanitizeSpreadsheetCell_(value) {
  var s = cleanSingleLine_(value === null || value === undefined ? "" : value);
  if (!s) return "";
  if (/^[=+\-@\t\r]/.test(s)) {
    return "'" + s;
  }
  return s;
}

function unquoteCell_(value) {
  var s = String(value === null || value === undefined ? "" : value);
  if (s.charAt(0) === "'" && /^[=+\-@\t\r]/.test(s.slice(1))) {
    return s.slice(1);
  }
  return s.trim();
}

function escapeHtml_(str) {
  return String(str === null || str === undefined ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeSubject_(str) {
  return cleanSingleLine_(str).slice(0, 140);
}

/* ==========================================================================
   Google Sheets Database Helpers
   ========================================================================== */

function getConfig_(throwOnError) {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = String(props.getProperty("SPREADSHEET_ID") || "").trim();
  var adminEmail = normalizeEmail_(props.getProperty("ADMIN_EMAIL") || "");
  var sharedSecret = String(props.getProperty("SHARED_SECRET") || "").trim();

  var valid =
    Boolean(spreadsheetId) &&
    isValidEmail_(adminEmail) &&
    sharedSecret.length >= 32;

  if (!valid) {
    if (throwOnError) {
      throw new Error(
        "Missing or invalid Script Properties. Configure SPREADSHEET_ID, ADMIN_EMAIL, and SHARED_SECRET (>= 32 chars)."
      );
    }
    return null;
  }

  return {
    spreadsheetId: spreadsheetId,
    adminEmail: adminEmail,
    sharedSecret: sharedSecret,
  };
}

function ensureRegistrationsSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    var headerRange = sheet.getRange(1, 1, 1, REGISTRATIONS_HEADERS.length);
    headerRange.setValues([REGISTRATIONS_HEADERS]);
    headerRange
      .setBackground("#102C50")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setVerticalAlignment("middle");
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 32);
    return sheet;
  }

  // Verify existing header row without ever overwriting rows
  var currentHeaders = sheet.getRange(1, 1, 1, REGISTRATIONS_HEADERS.length).getValues()[0];
  for (var i = 0; i < REGISTRATIONS_HEADERS.length; i++) {
    if (String(currentHeaders[i] || "").trim() !== REGISTRATIONS_HEADERS[i]) {
      throw new Error(
        "Unexpected header in Registrations column " +
          (i + 1) +
          ". Expected " +
          REGISTRATIONS_HEADERS[i] +
          " — refusing to overwrite existing sheet."
      );
    }
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function findRowByEmail_(sheet, normalizedEmail) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  var emailValues = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
  for (var i = 0; i < emailValues.length; i++) {
    var cellEmail = normalizeEmail_(unquoteCell_(emailValues[i][0]));
    if (cellEmail === normalizedEmail) {
      return i + 2;
    }
  }
  return -1;
}

function generateRegistrationId_() {
  var uuid = Utilities.getUuid().replace(/-/g, "").slice(0, 10).toUpperCase();
  return "SM-" + uuid;
}

/* ==========================================================================
   Email Automation & Branded HTML Templates
   ========================================================================== */

function dispatchUserConfirmationEmail_(record) {
  try {
    if (MailApp.getRemainingDailyQuota() <= 0) {
      Logger.log(JSON.stringify({ event: "USER_EMAIL_SKIPPED_QUOTA" }));
      return "FAILED";
    }

    var safeName = escapeHtml_(record.name);
    var safeRegId = escapeHtml_(record.registrationId);
    var safeUserType = escapeHtml_(record.userType);
    var safeCity = record.city ? escapeHtml_(record.city) : "Not specified";
    var consentBadge = record.marketingConsent
      ? "Opted in to optional product updates &amp; launch announcements (withdraw any time)."
      : "Transactional confirmation only &mdash; you are not subscribed to promotional emails.";

    var htmlBody =
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
      '<body style="margin:0;padding:0;background-color:#EDF5FF;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#102C50;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#EDF5FF;padding:28px 14px;">' +
      '<tr><td align="center">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:20px;border:1px solid #E2E8F0;overflow:hidden;">' +
      '<tr><td style="background:linear-gradient(135deg,#102C50 0%,#1769D2 100%);background-color:#102C50;padding:30px 28px;text-align:left;">' +
      '<div style="display:inline-block;background-color:#16A765;color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:14px;">Early Access Confirmed</div>' +
      '<h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:800;color:#FFFFFF;">Welcome to StayMate</h1>' +
      '<p style="margin:6px 0 0 0;font-size:14px;color:#DCE9FF;">Find your people. Find your place. Live better.</p>' +
      '</td></tr>' +
      '<tr><td style="padding:30px 28px 22px 28px;">' +
      '<p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">Hi <strong>' + safeName + '</strong>,</p>' +
      '<p style="margin:0 0 20px 0;font-size:15px;line-height:1.65;color:#334E6E;">Your early-access registration has been received. Thank you for joining us early as we build an India-first, student-focused platform for finding compatible roommates and clearer shared housing.</p>' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#EDF5FF;border:1px solid #C8DDFB;border-radius:14px;margin-bottom:22px;">' +
      '<tr><td style="padding:18px 20px;">' +
      '<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1256AB;">Registration Reference</p>' +
      '<p style="margin:0 0 12px 0;font-size:20px;font-weight:800;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#102C50;">' + safeRegId + '</p>' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;color:#334E6E;">' +
      '<tr><td style="padding:3px 0;"><strong>Profile Category:</strong> ' + safeUserType + '</td></tr>' +
      '<tr><td style="padding:3px 0;"><strong>Preferred City:</strong> ' + safeCity + '</td></tr>' +
      '</table></td></tr></table>' +
      '<h2 style="margin:0 0 10px 0;font-size:16px;font-weight:700;color:#102C50;">What happens next</h2>' +
      '<ul style="margin:0 0 22px 0;padding-left:18px;font-size:14px;line-height:1.65;color:#334E6E;">' +
      '<li style="margin-bottom:6px;">Your registration ID reserves your place on the early-access list.</li>' +
      '<li style="margin-bottom:6px;">As StayMate opens pilot cohorts, early registrants receive priority access details based on category and city demand.</li>' +
      '<li>We keep your contact data private and never sell or share it for advertising.</li>' +
      '</ul>' +
      '<div style="background-color:#E8F7EF;border:1px solid #B7E4CC;border-radius:12px;padding:14px 16px;margin-bottom:22px;">' +
      '<p style="margin:0 0 4px 0;font-size:12px;font-weight:700;color:#0B7A47;">Communication &amp; Consent</p>' +
      '<p style="margin:0;font-size:13px;line-height:1.55;color:#102C50;">' + consentBadge + '</p>' +
      '</div>' +
      '<p style="margin:0;font-size:14px;line-height:1.6;color:#64748B;">Warm regards,<br><strong style="color:#102C50;">The StayMate Team</strong><br>Find your people. Find your place. Live better.</p>' +
      '</td></tr>' +
      '<tr><td style="background-color:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 28px;font-size:12px;line-height:1.55;color:#64748B;">' +
      'This is an automated confirmation triggered by your registration on StayMate. To withdraw optional marketing consent or request deletion, visit the Unsubscribe page on our website.' +
      '</td></tr></table></td></tr></table></body></html>';

    var textBody =
      "Hi " + record.name + ",\n\n" +
      "Your StayMate early-access registration is confirmed.\n\n" +
      "Registration ID: " + record.registrationId + "\n" +
      "Category: " + record.userType + "\n" +
      "Preferred City: " + (record.city || "Not specified") + "\n" +
      "Marketing Updates: " +
      (record.marketingConsent
        ? "Opted in (you may withdraw consent at any time via our Unsubscribe page)."
        : "Not opted in (transactional confirmation only).") +
      "\n\n" +
      "What happens next:\n" +
      "- Your registration ID reserves your place in our early-access list.\n" +
      "- We will only reach out regarding launch/access updates according to your preferences.\n\n" +
      "— The StayMate Team\nFind your people. Find your place. Live better.";

    MailApp.sendEmail({
      to: record.email,
      subject: safeSubject_("StayMate Early Access Confirmation (" + record.registrationId + ")"),
      body: textBody,
      htmlBody: htmlBody,
      name: "StayMate",
    });

    return "SENT";
  } catch (err) {
    Logger.log(JSON.stringify({ event: "USER_EMAIL_FAILED", code: safeErrorCode_(err) }));
    return "FAILED";
  }
}

function dispatchAdminNotificationEmail_(record, adminEmail) {
  try {
    if (!isValidEmail_(adminEmail)) return "SKIPPED";
    if (MailApp.getRemainingDailyQuota() <= 0) {
      Logger.log(JSON.stringify({ event: "ADMIN_EMAIL_SKIPPED_QUOTA" }));
      return "FAILED";
    }

    var safeRegId = escapeHtml_(record.registrationId);
    var safeName = escapeHtml_(record.name);
    var safeEmail = escapeHtml_(record.email);
    var safeUserType = escapeHtml_(record.userType);
    var safeCity = record.city ? escapeHtml_(record.city) : "Not provided";
    var safeConsent = record.marketingConsent ? "Opted In (Yes)" : "Not Opted In (No)";
    var safeConsentTs = record.consentTimestamp ? escapeHtml_(record.consentTimestamp) : "N/A";
    var safeRegTs = escapeHtml_(record.registeredAtIso);

    var htmlBody =
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head>' +
      '<body style="margin:0;padding:24px;background-color:#F8FAFC;font-family:Inter,Arial,sans-serif;color:#102C50;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">' +
      '<tr><td style="background-color:#102C50;padding:20px 24px;color:#FFFFFF;">' +
      '<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#16A765;">New Early-Access Registration</p>' +
      '<h1 style="margin:6px 0 0 0;font-size:20px;font-weight:800;color:#FFFFFF;">' + safeRegId + '</h1>' +
      '</td></tr>' +
      '<tr><td style="padding:22px 24px;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0" style="border-collapse:collapse;font-size:14px;">' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;width:40%;">Registration ID</td><td style="font-family:monospace;">' + safeRegId + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">Full Name</td><td>' + safeName + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">Email</td><td>' + safeEmail + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">User Category</td><td>' + safeUserType + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">Preferred City</td><td>' + safeCity + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">Marketing Consent</td><td>' + safeConsent + '</td></tr>' +
      '<tr style="border-bottom:1px solid #E2E8F0;"><td style="font-weight:700;">Consent Timestamp</td><td>' + safeConsentTs + '</td></tr>' +
      '<tr><td style="font-weight:700;">Registered At (UTC)</td><td>' + safeRegTs + '</td></tr>' +
      '</table></td></tr></table></body></html>';

    var textBody =
      "New StayMate Early-Access Registration\n\n" +
      "Registration ID: " + record.registrationId + "\n" +
      "Name: " + record.name + "\n" +
      "Email: " + record.email + "\n" +
      "User Category: " + record.userType + "\n" +
      "Preferred City: " + (record.city || "Not provided") + "\n" +
      "Marketing Consent: " + (record.marketingConsent ? "Yes" : "No") + "\n" +
      "Consent Timestamp: " + (record.consentTimestamp || "N/A") + "\n" +
      "Registered At: " + record.registeredAtIso + "\n";

    MailApp.sendEmail({
      to: adminEmail,
      subject: safeSubject_("[StayMate] New " + record.userType + " Early Access (" + record.registrationId + ")"),
      body: textBody,
      htmlBody: htmlBody,
      name: "StayMate Notifications",
    });

    return "SENT";
  } catch (err) {
    Logger.log(JSON.stringify({ event: "ADMIN_EMAIL_FAILED", code: safeErrorCode_(err) }));
    return "FAILED";
  }
}

/* ==========================================================================
   Safe JSON Response & Sanitized Error Helpers
   ========================================================================== */

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function safeErrorCode_(err) {
  if (!err) return "UNKNOWN_ERROR";
  if (typeof err === "object" && typeof err.name === "string") {
    return err.name.slice(0, 48);
  }
  return "RUNTIME_EXCEPTION";
}
