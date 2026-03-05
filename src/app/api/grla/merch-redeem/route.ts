import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/grla/merch-redeem — Validate $GRLA balance and record redemption.
 * Body: { wallet: string, itemId: string, quantity: number }
 * STUB: Logs intent to database. Full implementation validates balance + triggers fulfillment.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.wallet || !body.itemId) {
    return NextResponse.json(
      { error: "wallet and itemId are required" },
      { status: 400 }
    );
  }

  // Stub: log redemption intent
  console.log(`[grla] Merch redemption: wallet=${body.wallet} item=${body.itemId} qty=${body.quantity ?? 1}`);

  return NextResponse.json({
    success: true,
    wallet: body.wallet,
    itemId: body.itemId,
    quantity: body.quantity ?? 1,
    note: "Stub — redemption logged, fulfillment pending contract deployment",
  });
}
