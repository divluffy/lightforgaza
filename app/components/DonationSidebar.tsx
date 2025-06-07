// components/DonationSidebar.tsx

"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaBitcoin, FaWallet } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { SiCoinbase, SiEthereum } from "react-icons/si";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ethers } from "ethers";
import PhantomImg from "../assets/phantom.png";
import CoinbaseImg from "../assets/coinbase.png";
import TrustImg from "../assets/trust.png";
import MetamaskImg from "../assets/metamask.png";
import Image from "next/image";

type Props = {
  campaignId: string;
  initialCurrentAmount?: number;
  goalAmount?: number;
  username?: string;
};

declare global {
  interface Window {
    solana?: any;
    ethereum?: any;
  }
}

// *****************************
//  قراءة القيم من ملف الـ .env
// *****************************

const ETH_PLATFORM_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_ETH_ADDRESS!;
const SOL_PLATFORM_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_SOL_ADDRESS!;
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;

const PHANTOM_PLATFORM_USDC_ATA =
  process.env.NEXT_PUBLIC_PLATFORM_USDC_SPL_TOKEN_ACCOUNT!;
const PHANTOM_PLATFORM_USDT_ATA =
  process.env.NEXT_PUBLIC_PLATFORM_USDT_SPL_TOKEN_ACCOUNT!;
const PHANTOM_PLATFORM_WBTC_ATA =
  process.env.NEXT_PUBLIC_PLATFORM_WBTC_SPL_TOKEN_ACCOUNT!;

const EVM_USDC_CONTRACT = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS!;
const EVM_USDT_CONTRACT = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS!;
const EVM_WBTC_CONTRACT = process.env.NEXT_PUBLIC_WBTC_CONTRACT_ADDRESS!;

const SOL_PER_USD = 1 / 20;
const ETH_PER_USD = 1 / 2000;
const BTC_PER_USD = 1 / 40000;
const USDC_PER_USD = 1;
const USDT_PER_USD = 1;

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];

const PHANTOM_TOKENS: Array<{
  symbol: string;
  label: string;
  decimals: number;
}> = [
  { symbol: "SOL", label: "SOL", decimals: 9 },
  { symbol: "USDC", label: "USDC", decimals: 6 },
  { symbol: "USDT", label: "USDT", decimals: 6 },
  { symbol: "BTC", label: "BTC", decimals: 8 }, // wBTC-SPL بمنزلة 8 أرقام عشرية
];

const EVM_TOKENS: Array<{
  symbol: string;
  label: string;
  decimals: number;
  address: string;
}> = [
  {
    symbol: "ETH",
    label: "ETH",
    decimals: 18,
    address: "",
  },
  {
    symbol: "USDC",
    label: "USDC",
    decimals: 6,
    address: EVM_USDC_CONTRACT,
  },
  {
    symbol: "USDT",
    label: "USDT",
    decimals: 6,
    address: EVM_USDT_CONTRACT,
  },
  {
    symbol: "BTC",
    label: "BTC",
    decimals: 8,
    address: EVM_WBTC_CONTRACT,
  },
];

const PHANTOM_TOKEN_MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qif2XKekR4GTTMGgDWjt4Ne4F",
  USDT: "Es9vMFrzaCERaWfcFAusvZR5v2cnX2WZGmfL3ajGHvB",
  BTC: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
};

export default function DonationSidebar({
  campaignId,
  initialCurrentAmount = 0,
  goalAmount = 0,
  username,
}: Props) {
  const [collected, setCollected] = useState<number>(initialCurrentAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorMessage, setDonorMessage] = useState<string>("");
  const [donorName, setDonorName] = useState<string>(username || "");

  const [showModal, setShowModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState<
    "phantom" | "metamask" | "coinbase" | "trust" | null
  >(null);

  const [currency, setCurrency] = useState<string>("SOL");

  const remaining = Math.max(goalAmount - collected, 0);
  const percent =
    goalAmount > 0
      ? Math.min(Math.round((collected / goalAmount) * 100), 100)
      : 0;

  const presetAmounts = [25, 50, 125, 200, 500];

  // نحتاج عنصر فارغ داخل الـ DOM نستخدمه للـ portal
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // ننشئ عنصر div داخل body ونستخدمه لجذر البوابة (portal)
    const div = document.createElement("div");
    document.body.appendChild(div);
    setPortalRoot(div);
    return () => {
      document.body.removeChild(div);
    };
  }, []);

  const openModalWithWallet = (
    wallet: "phantom" | "metamask" | "coinbase" | "trust"
  ) => {
    setErrorMessage(null);
    setCustomAmount("");
    setDonorMessage("");
    if (!username) setDonorName("");
    setSelectedWallet(wallet);

    if (wallet === "phantom") setCurrency("SOL");
    else setCurrency("ETH");

    setShowModal(true);
  };

  const getCurrencyOptions = () => {
    if (selectedWallet === "phantom") {
      return PHANTOM_TOKENS.map((t) => ({
        value: t.symbol,
        label: t.label,
        decimals: t.decimals,
      }));
    } else if (
      selectedWallet === "metamask" ||
      selectedWallet === "coinbase" ||
      selectedWallet === "trust"
    ) {
      return EVM_TOKENS.map((t) => ({
        value: t.symbol,
        label: t.label,
        decimals: t.decimals,
      }));
    }
    return [];
  };

  const handleCurrencySelect = (newCurrency: string) => {
    setCurrency(newCurrency);
    setErrorMessage(null);
  };

  const confirmDonation = async () => {
    setErrorMessage(null);

    // 1. التحقق من صحة البيانات
    if (!donorName.trim()) {
      setErrorMessage("الرجاء إدخال اسم المتبرّع.");
      return;
    }
    const amountNumber = parseFloat(customAmount);
    if (isNaN(amountNumber)) {
      setErrorMessage("الرجاء إدخال رقم صحيح لمبلغ التبرّع.");
      return;
    }
    if (amountNumber < 10) {
      setErrorMessage("الحد الأدنى للتبرّع هو 10 دولارات.");
      return;
    }
    if (amountNumber > 100000) {
      setErrorMessage("الحد الأقصى للتبرّع هو 100,000 دولار.");
      return;
    }
    if (donorMessage.length > 100) {
      setErrorMessage("الرسالة يجب ألا تتجاوز 100 حرف.");
      return;
    }
    if (!selectedWallet) {
      setErrorMessage("الرجاء اختيار محفظة.");
      return;
    }

    try {
      setIsLoading(true);
      let signature: string | null = null;

      // 2. إذا كانت Phantom (شبكة Solana)
      if (selectedWallet === "phantom") {
        if (!window.solana || !window.solana.isPhantom) {
          setErrorMessage(
            "لم يتم العثور على محفظة Phantom. الرجاء تثبيتها أو استخدام متصفح يدعمها."
          );
          setIsLoading(false);
          return;
        }
        const provider = window.solana;
        const resp = await provider.connect();
        const userPublicKey = new PublicKey(resp.publicKey.toString());

        // تحويل SOL
        if (currency === "SOL") {
          const lamportsForDonation = Math.round(
            amountNumber * SOL_PER_USD * 1_000_000_000
          );
          const connection = new Connection(SOLANA_RPC_URL, "confirmed");
          const { blockhash } = await connection.getLatestBlockhash(
            "confirmed"
          );
          const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: userPublicKey,
          }).add(
            SystemProgram.transfer({
              fromPubkey: userPublicKey,
              toPubkey: new PublicKey(SOL_PLATFORM_WALLET_ADDRESS),
              lamports: lamportsForDonation,
            })
          );
          const signedTx = await provider.signTransaction(transaction);
          const txSignature = await connection.sendRawTransaction(
            signedTx.serialize()
          );
          await connection.confirmTransaction(txSignature, "confirmed");
          signature = txSignature;
        }
        // تحويل SPL Token (USDC-SPL, USDT-SPL, wBTC-SPL)
        else {
          const tokenInfo = PHANTOM_TOKENS.find((t) => t.symbol === currency);
          if (!tokenInfo) {
            setErrorMessage("العملة المحددة غير مدعومة في محفظة Phantom.");
            setIsLoading(false);
            return;
          }
          const mintAddress = PHANTOM_TOKEN_MINTS[currency];
          if (!mintAddress) {
            setErrorMessage(
              `لم يتم تكوين عنوان Mint الخاصّ بـ ${currency} في الكود.`
            );
            setIsLoading(false);
            return;
          }
          const mintPubkey = new PublicKey(mintAddress);

          let platformTokenAccount = "";
          if (currency === "USDC")
            platformTokenAccount = PHANTOM_PLATFORM_USDC_ATA;
          else if (currency === "USDT")
            platformTokenAccount = PHANTOM_PLATFORM_USDT_ATA;
          else if (currency === "BTC")
            platformTokenAccount = PHANTOM_PLATFORM_WBTC_ATA;
          else {
            setErrorMessage(`العملة ${currency} غير معروفة في قائمة Phantom.`);
            setIsLoading(false);
            return;
          }
          const toATA = new PublicKey(platformTokenAccount);
          const fromATA = await getAssociatedTokenAddress(
            mintPubkey,
            userPublicKey
          );
          const connection = new Connection(SOLANA_RPC_URL, "confirmed");

          const tokenAccountInfo = await connection
            .getTokenAccountBalance(fromATA)
            .catch(() => null);
          const userTokenBalance = tokenAccountInfo
            ? BigInt(tokenAccountInfo.value.amount)
            : BigInt(0);

          let tokenPricePerUSD = 1;
          if (currency === "USDC") tokenPricePerUSD = USDC_PER_USD;
          else if (currency === "USDT") tokenPricePerUSD = USDT_PER_USD;
          else if (currency === "BTC") tokenPricePerUSD = BTC_PER_USD;

          const amountInSmallestUnits = BigInt(
            Math.round(
              amountNumber * tokenPricePerUSD * 10 ** tokenInfo.decimals
            )
          );

          if (userTokenBalance < amountInSmallestUnits) {
            setErrorMessage(
              `رصيدك من ${currency} غير كافٍ. الرجاء شراء ${currency} في محفظتك أولًا ثم حاول مرة أخرى.`
            );
            setIsLoading(false);
            return;
          }

          const { blockhash } = await connection.getLatestBlockhash(
            "confirmed"
          );
          const transaction = new Transaction({
            recentBlockhash: blockhash,
            feePayer: userPublicKey,
          });
          const transferIx = createTransferInstruction(
            fromATA,
            toATA,
            userPublicKey,
            amountInSmallestUnits,
            [],
            TOKEN_PROGRAM_ID
          );
          transaction.add(transferIx);

          const signedTx = await provider.signTransaction(transaction);
          const txSignature = await connection.sendRawTransaction(
            signedTx.serialize()
          );
          await connection.confirmTransaction(txSignature, "confirmed");
          signature = txSignature;
        }
      }
      // 3. إذا كانت EVM (MetaMask, Coinbase, Trust)
      else {
        if (!window.ethereum) {
          setErrorMessage(
            "لم يتم العثور على محفظة متوافقة مع Ethereum. الرجاء تثبيت MetaMask أو استخدام محفظة EVM."
          );
          setIsLoading(false);
          return;
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const userAddress = await signer.getAddress();

        // نقل ETH
        if (currency === "ETH") {
          const ethAmount = amountNumber * ETH_PER_USD;
          const valueInWei = ethers.parseEther(ethAmount.toFixed(18));
          const userEthBalance = await browserProvider.getBalance(userAddress);
          if (userEthBalance < valueInWei) {
            setErrorMessage(
              "رصيد ETH غير كافٍ. الرجاء شراء ETH في محفظتك أولًا."
            );
            setIsLoading(false);
            return;
          }
          const tx = await signer.sendTransaction({
            to: ETH_PLATFORM_WALLET_ADDRESS,
            value: valueInWei,
          });
          const receipt = await tx.wait();
          signature = receipt.transactionHash;
        }
        // نقل ERC-20 Token (USDC, USDT, WBTC)
        else {
          const tokenInfo = EVM_TOKENS.find((t) => t.symbol === currency);
          if (!tokenInfo) {
            setErrorMessage("العملة المحددة غير مدعومة في محفظة EVM.");
            setIsLoading(false);
            return;
          }
          if (!tokenInfo.address) {
            setErrorMessage(
              `لم يتم تكوين عنوان العقد الذكي لـ ${currency} في الكود.`
            );
            setIsLoading(false);
            return;
          }
          const erc20Contract = new ethers.Contract(
            tokenInfo.address,
            ERC20_ABI,
            signer
          );
          const userTokenBalance: bigint = await erc20Contract
            .balanceOf(userAddress)
            .then((bal: any) => BigInt(bal.toString()));

          let amountTokensInSmallest;
          if (currency === "USDC") {
            amountTokensInSmallest = ethers.parseUnits(
              (amountNumber * USDC_PER_USD).toFixed(tokenInfo.decimals),
              tokenInfo.decimals
            );
          } else if (currency === "USDT") {
            amountTokensInSmallest = ethers.parseUnits(
              (amountNumber * USDT_PER_USD).toFixed(tokenInfo.decimals),
              tokenInfo.decimals
            );
          } else if (currency === "BTC") {
            amountTokensInSmallest = ethers.parseUnits(
              (amountNumber * BTC_PER_USD).toFixed(tokenInfo.decimals),
              tokenInfo.decimals
            );
          } else {
            setErrorMessage(`حساب الدولار إلى ${currency} غير معرَّف.`);
            setIsLoading(false);
            return;
          }

          if (userTokenBalance < BigInt(amountTokensInSmallest)) {
            setErrorMessage(
              `رصيدك من ${currency} غير كافٍ. الرجاء شراء ${currency} في محفظتك أولًا.`
            );
            setIsLoading(false);
            return;
          }

          const tx = await erc20Contract.transfer(
            ETH_PLATFORM_WALLET_ADDRESS!,
            amountTokensInSmallest
          );
          const receipt = await tx.wait();
          signature = receipt.transactionHash;
        }
      }

      // 4. بعد نجاح التحويل، نُحدِّث الواجهة ونرسل بيانات التبرع
      setCollected((prev) => prev + amountNumber);

      await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount: parseFloat(amountNumber.toFixed(2)),
          donorName,
          donorMessage: donorMessage.trim() || null,
          walletType: selectedWallet,
          currency,
          signature,
          isMock: false,
        }),
      });

      alert("تمّت عملية التبرّع بنجاح! شكرًا لدعمك.");
      setShowModal(false);
      setCustomAmount("");
      setDonorMessage("");
      setDonorName(username || "");
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Donation error:", err);
      setErrorMessage("حدث خطأ أثناء تنفيذ عملية التبرّع. حاول مجددًا.");
    } finally {
      setIsLoading(false);
    }
  };

  // دالة مُساعدة لعرض المودال عبر createPortal
  const renderModal = (content: ReactNode) => {
    if (!portalRoot) return null;
    return createPortal(content, portalRoot);
  };

  // المحتوى الداخلي لمودال التبرّع
  const donationModalContent = (
    <div className="modal modal-open z-[9999]">
      <div className="modal-box relative max-w-lg w-full">
        {/* زر إغلاق المودال */}
        <button
          onClick={() => {
            setShowModal(false);
            setErrorMessage(null);
            setCustomAmount("");
            setDonorMessage("");
            setDonorName(username || "");
          }}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          تبرّع للحملة
        </h2>

        {/* الاسم الكامل */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            الاسم الكامل:
          </label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="مثال: أحمد محمد"
          />
        </div>

        {/* مبلغ التبرّع */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            مبلغ التبرّع بالدولار (10 - 100,000):
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="مثال: 50"
            min={10}
            max={100000}
          />
        </div>

        {/* المبالغ المسبقة */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setCustomAmount(amt.toString())}
              className={`px-4 py-2 border rounded-full transition ${
                customAmount === amt.toString()
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 dark:bg-gray-700 border-transparent"
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* اختيار العملة */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">اختر العملة:</label>
          <div className="flex gap-3 flex-wrap justify-center">
            {getCurrencyOptions().map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleCurrencySelect(opt.value)}
                className={`w-[80px] border rounded-lg py-2 text-center font-medium transition ${
                  currency === opt.value
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* رسالة المتبرّع */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">
            رسالة (اختياري) - حتى 100 حرف
          </label>
          <textarea
            value={donorMessage}
            onChange={(e) => setDonorMessage(e.target.value)}
            maxLength={100}
            className="w-full border rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="اكتب رسالة شكر أو تحفيز..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {donorMessage.length}/100
          </p>
        </div>

        {/* أزرار التأكيد والإلغاء */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={confirmDonation}
            disabled={isLoading}
            className="btn btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-lg self-center"
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : selectedWallet === "phantom" ? (
              <Image
                src={PhantomImg}
                alt="logo-phantom-wallet"
                width={25}
                height={25}
                className="rounded-lg"
              />
            ) : selectedWallet === "metamask" ? (
              <Image
                src={MetamaskImg}
                alt="logo-Metamask-wallet"
                width={25}
                height={30}
              />
            ) : selectedWallet === "coinbase" ? (
              <Image
                src={CoinbaseImg}
                alt="logo-Coinbase-wallet"
                width={25}
                height={25}
              />
            ) : (
              <Image
                src={TrustImg}
                alt="logo-Trust-wallet"
                width={25}
                height={25}
              />
            )}
            {isLoading ? "جارٍ المعاملة..." : "تبرّع الآن"}
          </button>
          <button
            onClick={() => {
              setShowModal(false);
              setErrorMessage(null);
              setCustomAmount("");
              setDonorMessage("");
              setDonorName(username || "");
            }}
            className="btn btn-ghost px-6 py-3 rounded-lg self-center"
          >
            إلغاء
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500 text-center">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );

  // المحتوى الداخلي لمودال الملاحظة
  const noteModalContent = (
    <div className="modal modal-open z-[9999]">
      <div className="modal-box relative max-w-lg w-full">
        <button
          onClick={() => setShowNoteModal(false)}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-4 text-center">
          سبب اختيار وتحويل التبرّع
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-start+++++++++++++++++++++">
          تم اختيار هذه المحافظ (Phantom، MetaMask، Coinbase Wallet، Trust
          Wallet) نظرًا للوضع المالي الصعب والحصار المفروض على قطاع غزة. هذه
          الطرق توفر فرصًا للحصول على العملات الرقمية بسهولة وتحويل التبرعات
          بسرعة وأمان، دون الحاجة لوسطاء تقليديين. بهذه الطريقة، يمكننا ضمان
          وصول أكبر عدد من التبرعات إلى المحتاجين بأقل تكاليف ورسوم ممكنة،
          وتفادي التعطيلات البنكية والإجراءات الروتينية المعقدة.
        </p>
        <div className="space-y-3 text-start">
          <a
            href="https://example.com/phantom-guide"
            target="_blank"
            className="block text-primary hover:underline"
          >
            شرح شراء وتحويل عبر Phantom
          </a>
          <a
            href="https://example.com/metamask-guide"
            target="_blank"
            className="block text-primary hover:underline"
          >
            شرح شراء وتحويل عبر MetaMask
          </a>
          <a
            href="https://example.com/coinbase-guide"
            target="_blank"
            className="block text-primary hover:underline"
          >
            شرح شراء وتحويل عبر Coinbase Wallet
          </a>
          <a
            href="https://example.com/trustwallet-guide"
            target="_blank"
            className="block text-primary hover:underline"
          >
            شرح شراء وتحويل عبر Trust Wallet
          </a>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowNoteModal(false)}
            className="btn btn-primary px-6 py-2 rounded-lg"
          >
            فهمت
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ========================= */}
      {/* Sidebar الرئيسي للتبرّع */}
      {/* ========================= */}
      <div className="border rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-xl">
        <h3 className="text-3xl font-bold mb-6 text-center">دعم الحملة</h3>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-md font-medium">المبلغ المجمّع:</span>
            <span className="text-xl font-semibold text-green-600 dark:text-green-400">
              {collected.toLocaleString()} USD
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-md font-medium">هدف الحملة:</span>
            <span className="text-lg font-medium">
              {goalAmount.toLocaleString()} USD
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div className="h-4 bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>{percent}%</span>
            <span>نسبة الإنجاز</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => openModalWithWallet("phantom")}
            className="btn btn-primary flex items-center justify-center gap-2 py-3 rounded-xl"
          >
            <Image
              src={PhantomImg}
              alt="logo-phantom-wallet"
              width={25}
              height={25}
              className="rounded-lg"
            />
            Phantom
          </button>

          <button
            onClick={() => openModalWithWallet("metamask")}
            className="btn btn-warning flex items-center justify-center gap-2 py-3 rounded-xl"
          >
            <Image
              src={MetamaskImg}
              alt="logo-Metamask-wallet"
              width={25}
              height={30}
            />
            MetaMask
          </button>
          <button
            onClick={() => openModalWithWallet("coinbase")}
            className="btn btn-info flex items-center justify-center gap-2 py-3 rounded-xl"
          >
            <Image
              src={CoinbaseImg}
              alt="logo-Coinbase-wallet"
              width={25}
              height={25}
            />
            Coinbase
          </button>
          <button
            onClick={() => openModalWithWallet("trust")}
            className="btn btn-success flex items-center justify-center gap-2 py-3 rounded-xl"
          >
            <Image
              src={TrustImg}
              alt="logo-Trust-wallet"
              width={25}
              height={25}
            />
            Trust Wallet
          </button>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowNoteModal(true)}
            className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 flex items-center gap-1"
          >
            <FiInfo /> سبب اختيار طرق الدفع
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-500 text-center">
            {errorMessage}
          </p>
        )}
      </div>

      {/* استخدام البوابة (Portal) لإظهار المودالات داخل الـ body مباشرة */}
      {showModal && renderModal(donationModalContent)}
      {showNoteModal && renderModal(noteModalContent)}
    </>
  );
}
