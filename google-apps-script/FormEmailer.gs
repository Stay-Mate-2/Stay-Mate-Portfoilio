/**
 * StayMate — Optional Google Sheets Form Submit Emailer (Zero-Secret Helper)
 *
 * NOTE: You do NOT need this script if you turn ON Google Forms' built-in setting:
 *   Form Settings -> Responses -> "Send responders a copy of their response" = "Always"
 *
 * Use this script ONLY if you later want custom StayMate-branded HTML confirmation
 * emails sent from staymate2@gmail.com when a form response arrives in Sheets.
 *
 * Setup (Optional, zero external URLs or secrets required):
 * 1. Open your linked Google Sheet (`StayMate_Early_Access_Database`).
 * 2. Click Extensions -> Apps Script, paste this file, and save.
 * 3. Click Triggers (clock icon) -> Add Trigger:
 *      Function: onFormSubmit | Event source: From spreadsheet | Event type: On form submit
 * 4. Authorize Gmail sending once when prompted.
 */

var STAYMATE_WEBSITE_URL = "https://stay-mate-portfoilio.vercel.app/";
var STAYMATE_UNSUBSCRIBE_URL = "https://stay-mate-portfoilio.vercel.app/unsubscribe";
var STAYMATE_ADMIN_EMAIL = "staymate2@gmail.com";

function onFormSubmit(e) {
  if (!e || !e.namedValues) {
    Logger.log("onFormSubmit called without form event payload; skipping.");
    return;
  }

  var name = sanitizeText_(pickField_(e.namedValues, ["Full Name", "Name"]));
  var email = normalizeEmail_(pickField_(e.namedValues, ["Email Address", "Email"]));
  var category = sanitizeText_(pickField_(e.namedValues, ["I am a…", "I am a...", "I am a", "Category"]));
  var city = sanitizeText_(pickField_(e.namedValues, ["Preferred City", "City"]));
  var updatesPref = sanitizeText_(pickField_(e.namedValues, ["Email Updates Permission", "Marketing Consent"]));

  if (!email) {
    Logger.log("Skipping confirmation email: invalid or missing email address.");
    return;
  }

  var safeName = escapeHtml_(name || "there");
  var safeEmail = escapeHtml_(email);
  var safeCategory = escapeHtml_(category || "Not specified");
  var safeCity = escapeHtml_(city || "Not specified");
  var optedIntoUpdates = /yes/i.test(updatesPref);

  var subject = "You're on the StayMate Early-Access List!";
  var plainBody =
    "Hi " + (name || "there") + ",\n\n" +
    "Your StayMate early-access registration has been received.\n\n" +
    "Details recorded:\n" +
    "- Email: " + email + "\n" +
    "- Role: " + (category || "Not specified") + "\n" +
    (city ? "- Preferred City: " + city + "\n" : "") +
    "- Optional Product Updates: " + (optedIntoUpdates ? "Opted in" : "Not opted in") + "\n\n" +
    "You can opt out or request removal at any time at " + STAYMATE_UNSUBSCRIBE_URL +
    " or by replying to " + STAYMATE_ADMIN_EMAIL + ".\n\n" +
    "— Team StayMate";

  var htmlBody =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#102C50;line-height:1.6;">' +
    '<h2 style="color:#1769D2;margin-bottom:8px;">Welcome to StayMate Early Access</h2>' +
    '<p>Hi ' + safeName + ',</p>' +
    '<p>Thank you for registering! Your early-access entry has been saved.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;background:#EDF5FF;border-radius:12px;">' +
    '<tr><td style="padding:10px 14px;font-weight:bold;">Email</td><td style="padding:10px 14px;">' + safeEmail + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-weight:bold;">Category</td><td style="padding:10px 14px;">' + safeCategory + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-weight:bold;">Preferred City</td><td style="padding:10px 14px;">' + safeCity + '</td></tr>' +
    '<tr><td style="padding:10px 14px;font-weight:bold;">Product Updates</td><td style="padding:10px 14px;">' + (optedIntoUpdates ? "Opted in" : "Not opted in") + '</td></tr>' +
    '</table>' +
    '<p style="font-size:13px;color:#64748B;">Want to opt out or delete your record? Visit <a href="' + STAYMATE_UNSUBSCRIBE_URL + '" style="color:#1769D2;">' + STAYMATE_UNSUBSCRIBE_URL + '</a> or email <a href="mailto:' + STAYMATE_ADMIN_EMAIL + '" style="color:#1769D2;">' + STAYMATE_ADMIN_EMAIL + '</a>.</p>' +
    '<p style="font-size:12px;color:#64748B;">StayMate · <a href="' + STAYMATE_WEBSITE_URL + '" style="color:#1769D2;">' + STAYMATE_WEBSITE_URL + '</a></p>' +
    '</div>';

  try {
    MailApp.sendEmail({
      to: email,
      replyTo: STAYMATE_ADMIN_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: "StayMate",
    });
  } catch (err) {
    Logger.log("Failed to send user confirmation email: " + String(err));
  }
}

function pickField_(namedValues, candidates) {
  var keys = Object.keys(namedValues);
  for (var i = 0; i < candidates.length; i++) {
    var target = candidates[i].toLowerCase();
    for (var k = 0; k < keys.length; k++) {
      if (keys[k].toLowerCase() === target) {
        var val = namedValues[keys[k]];
        if (Array.isArray(val) && val.length > 0) return String(val[0] || "").trim();
        return String(val || "").trim();
      }
    }
  }
  return "";
}

function normalizeEmail_(raw) {
  var trimmed = String(raw || "").trim().toLowerCase();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed) ? trimmed : "";
}

function sanitizeText_(raw) {
  return String(raw || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, 120);
}

function escapeHtml_(raw) {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
