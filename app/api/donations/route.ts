// app/api/donations/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";

// عناوين المحفظة على الشبكة المناسبة
const SOLANA_PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const ETH_PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_ETH_ADDRESS;

if (!SOLANA_PLATFORM_WALLET_ADDRESS) {
  throw new Error("متغير البيئة PLATFORM_WALLET_ADDRESS غير معرف.");
}
if (!SOLANA_RPC_URL) {
  throw new Error("متغير البيئة SOLANA_RPC_URL غير معرف.");
}
if (!ETH_PLATFORM_WALLET_ADDRESS) {
  console.warn("لم يتم تعريف PLATFORM_ETH_ADDRESS في .env.prod.");
}

export async function POST(req: NextRequest) {
  try {
    const {
      campaignId,
      amount,
      donorName,
      donorMessage,
      walletType,
      currency,
      signature,
      isMock,
    } = (await req.json()) as {
      campaignId: string;
      amount: number;
      donorName: string;
      donorMessage?: string | null;
      walletType: "phantom" | "metamask" | "coinbase" | "trust";
      currency: "SOL" | "ETH" | "BTC";
      signature: string | null;
      isMock: boolean;
    };

    // إذا كانت المحفظة من نوع Phantom (شبكة سولانا)
    if (walletType === "phantom" && !isMock && signature) {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const txInfo: ParsedTransactionWithMeta | null =
        await connection.getParsedTransaction(signature, {
          commitment: "confirmed",
        });

      if (!txInfo) {
        return NextResponse.json(
          { error: "لم نتمكن من العثور على تفاصيل المعاملة على سولانا." },
          { status: 400 }
        );
      }

      let validTransfer = false;
      for (const instr of txInfo.transaction.message.instructions) {
        if (
          typeof (instr as any).parsed?.info?.destination === "string" &&
          (instr as any).parsed.info.destination ===
            SOLANA_PLATFORM_WALLET_ADDRESS
        ) {
          validTransfer = true;
          break;
        }
      }
      if (!validTransfer) {
        return NextResponse.json(
          { error: "المعاملة لا تحتوي على تحويل للعنوان الصحيح على سولانا." },
          { status: 400 }
        );
      }
    }

    // إذا كانت المحفظة من نوع EVM (Ethereum)
    // لا يتم التحقق الآني من المعاملة هنا (يمكن إضافة التحقق لاحقًا عبر etherscan API)
    // نفس الشيء لبقية المحافظ (coinbase، trust)

    const donation = await prisma.donation.create({
      data: {
        campaignId,
        amount,
        donorName,
        donorMessage: donorMessage ?? undefined,
        walletType,
        currency,
        signature: signature ?? undefined,
      },
    });

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { currentAmount: { increment: amount } },
    });

    return NextResponse.json({ message: "Donation recorded", donation });
  } catch (error: any) {
    console.error("API /donations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
