import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";

/**
 * POST /api/grla/earn — Record token earnings for validated BOGS submissions.
 * Body: { wallet: string, amount: number, submissionId: string }
 * STUB: Records to database only. Full implementation calls token contract.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.wallet || !body.amount || !body.submissionId) {
    return NextResponse.json(
      { error: "wallet, amount, and submissionId are required" },
      { status: 400 }
    );
  }

  // Update the BOGS submission with reward info
  await prisma.bogsSubmission.update({
    where: { id: body.submissionId },
    data: {
      rewardAmount: body.amount,
      submitterWallet: body.wallet,
      // rewardTxHash will be set when token contract is live
    },
  });

  return NextResponse.json({
    success: true,
    wallet: body.wallet,
    amount: body.amount,
    submissionId: body.submissionId,
    note: "Stub — token transfer pending contract deployment",
  });
}
