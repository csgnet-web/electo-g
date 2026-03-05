import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/grla/b2b-access — Authenticate B2B customers with $GRLA balance.
 * Body: { apiKey: string, wallet: string }
 * STUB: Returns success. Full implementation checks on-chain $GRLA balance.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.apiKey || !body.wallet) {
    return NextResponse.json(
      { error: "apiKey and wallet are required" },
      { status: 400 }
    );
  }

  // Stub: always grants access. In production, verify $GRLA balance on-chain.
  return NextResponse.json({
    authorized: true,
    wallet: body.wallet,
    balance: 0,
    note: "Stub — balance check pending contract deployment",
  });
}
