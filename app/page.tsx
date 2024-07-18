"use client";

import Image from "next/image";
import { OWNER_1_PRIVATE_KEY, OWNER_1_PUBLIC_KEY } from "./keys";
import SafeApiKit from "@safe-global/api-kit";
import { useEffect } from "react";
import { useState } from "react";
import { SafeFactory } from "@safe-global/protocol-kit";
import { RPC_URL } from "./config";
import Safe from "@safe-global/protocol-kit";
import { getOrCreatePasskey } from "@/lib/createPasskey";

export default function Home() {
  const [safesOfOwner, setSafesOfOwner] = useState([]);
  const [isDeployingSafe, setIsDeployingSafe] = useState(false);
  const [selectedSafe, setSelectedSafe] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);

  const checkForDeployedSafes = async () => {
    const apiKit = new SafeApiKit({
      chainId: 11155111,
    });

    const safesOfOwner = await apiKit.getSafesByOwner(OWNER_1_PUBLIC_KEY);
    console.log("Safes of Owners:", safesOfOwner);
    setSafesOfOwner(safesOfOwner.safes);
  };

  const deploySafeForOwner = async () => {
    setIsDeployingSafe(true);
    const safeFactory = await SafeFactory.init({
      provider: RPC_URL,
      signer: OWNER_1_PRIVATE_KEY,
    });

    const safe = await safeFactory.deploySafe({
      safeAccountConfig: {
        owners: [await OWNER_1_PUBLIC_KEY],
        threshold: 1,
      },
    });

    console.log("Deployed Safe:", safe);
    setSafesOfOwner([...safesOfOwner, safe.safeAddress]);
    setIsDeployingSafe(false);
    setSelectedSafe(safe.safeAddress);
  };

  const handleAddPasskeyAsOwner = async () => {
    const passkey = await getOrCreatePasskey();

    const safe = await Safe.init({
      provider: RPC_URL,
      signer: OWNER_1_PRIVATE_KEY,
      safeAddress: selectedSafe,
    });

    const safeTransaction = await safe.createAddOwnerTx({
      passkey,
    });

    console.log("Safe Transaction:", safeTransaction);

    const signedTransaction = await safe.signTransaction(safeTransaction);

    console.log("Signed Transaction:", signedTransaction);

    const { hash } = await safe.executeTransaction(signedTransaction);
    setTransactionHash(hash);
  };

  useEffect(() => {
    checkForDeployedSafes();
  }, []);

  return (
    <main className="min-h-screen flex-col items-center justify-between p-24">
      <div className="mt-16">
        <p className="text-lg font-semibold mb-4">Safes:</p>
        <div className="border border-neutral-800 rounded-lg">
          {safesOfOwner?.map((safe, index) => (
            <div
              key={index}
              onClick={() => setSelectedSafe(safe)}
              className={`${
                selectedSafe === safe
                  ? "bg-neutral-800/30"
                  : "hover:bg-neutral-800/30"
              } cursor-pointer flex flex-col items-center justify-center px-8 mb-4`}
            >
              <p className="text-lg font-semibold">
                {index + 1}: {safe}
              </p>
            </div>
          ))}
        </div>
      </div>

      {safesOfOwner.length === 0 && (
        <div className="justify-center p-8 border border-neutral-800 rounded-lg bg-zinc-800/30">
          <p className="text-lg font-semibold">You currently have no Safes.</p>
          <p>Here you can deploy a Safe with you as the only owner:</p>
          <button
            onClick={deploySafeForOwner}
            className="mt-4 px-4 py-2 font-semibold text-white bg-neutral-800 rounded-lg"
          >
            Deploy Safe
          </button>
          {isDeployingSafe && <p>Deploying Safe...</p>}
        </div>
      )}

      {selectedSafe && (
        <div className="mt-8">
          <button
            onClick={handleAddPasskeyAsOwner}
            className="px-4 py-2 font-semibold text-white bg-neutral-800 rounded-lg"
          >
            Add Passkey as Owner
          </button>
        </div>
      )}

      {transactionHash && (
        <div className="mt-8">
          <p>
            The transaction to add the passkey as the owner has been sent:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-current text-blue-500 mb-4"
            >
              {transactionHash}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
