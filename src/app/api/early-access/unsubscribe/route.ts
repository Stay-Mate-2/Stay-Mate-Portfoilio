import type { NextRequest } from "next/server";
import { jsonMethodNotAllowed } from "@/lib/api-guard";
import { processConsentWithdrawal } from "@/lib/early-access/handlers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return processConsentWithdrawal(req);
}

export function GET() {
  return jsonMethodNotAllowed();
}

export function PUT() {
  return jsonMethodNotAllowed();
}

export function PATCH() {
  return jsonMethodNotAllowed();
}

export function DELETE() {
  return jsonMethodNotAllowed();
}
