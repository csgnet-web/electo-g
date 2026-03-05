import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/grla/balance/:wallet — Returns current $GRLA balance for a wallet.
 * STUB: Returns 0. Full implementation reads from token contract.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params;

  return NextResponse.json({
    wallet,
    balance: 0,
    note: "Stub — on-chain balance lookup pending contract deployment",
  });
}
