"use client";

import Image from "next/image";
import {
  OWNER_1_PRIVATE_KEY,
  OWNER_2_PRIVATE_KEY,
  OWNER_1_PUBLIC_KEY,
  OWNER_2_PUBLIC_KEY,
  OWNER_3_PUBLIC_KEY,
} from "./keys";
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
  const [dummyTransactionHash, setDummyTransactionHash] = useState(null);

  const [isTransactionPending, setIsTransactionPending] = useState(false);

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
        owners: [
          await OWNER_1_PUBLIC_KEY,
          await OWNER_2_PUBLIC_KEY,
          await OWNER_3_PUBLIC_KEY,
        ],
        threshold: 2,
      },
    });

    console.log("Deployed Safe:", safe);
    setSafesOfOwner([...safesOfOwner, await safe.getAddress()]);
    setIsDeployingSafe(false);
    setSelectedSafe(await safe.getAddress());
  };

  const handleAddPasskeyAsOwner = async () => {
    // Get the passkey
    const passkey = await getOrCreatePasskey();

    // Initialize the Safe with Owner 1
    let safe = await Safe.init({
      provider: RPC_URL,
      signer: OWNER_1_PRIVATE_KEY,
      safeAddress: selectedSafe,
    });

    // Create the transaction to add the passkey as an owner
    const addOwnerTx = await safe.createAddOwnerTx({
      passkey,
    });
    console.log("Safe Transaction:", addOwnerTx);

    // Sign the transaction with Owner 1
    const addOwnerTx_signed_1 = await safe.signTransaction(addOwnerTx);
    console.log("Signed Transaction:", addOwnerTx_signed_1);

    // Sign the transaction with Owner 2
    safe = await safe.connect({ signer: OWNER_2_PRIVATE_KEY });
    const addOwnerTx_signed_2 = await safe.signTransaction(addOwnerTx_signed_1);
    console.log("Signed Transaction:", addOwnerTx_signed_2);

    // Execute the transaction as Owner 1
    safe = await safe.connect({ signer: OWNER_1_PRIVATE_KEY });
    const { hash } = await safe.executeTransaction(addOwnerTx_signed_2);

    setTransactionHash(hash);
  };

  const handleSendTransaction = async () => {
    setIsTransactionPending(true);
    console.log("Sending transaction...");

    // Get the passkey
    const passkey = await getOrCreatePasskey();

    // Initialize the Safe with Owner 1
    let safe = await Safe.init({
      provider: RPC_URL,
      signer: passkey,
      safeAddress: selectedSafe,
    });

    // Create a dummy transaction (sending 0 eth to the zero address)
    const dummyTransaction = {
      to: "0x0000000000000000000000000000000000000000",
      value: 0n,
      data: "0x",
    };

    // Create and sign the transaction with Owner 1
    const tx = await safe.createTransaction({
      transactions: [dummyTransaction],
    });

    // Sign the transaction with the passkey
    const txSigned_1 = await safe.signTransaction(tx);

    // Execute the transaction as Owner 1 (which has Sepolia Eth)
    safe = await safe.connect({ signer: OWNER_1_PRIVATE_KEY });
    const txSigned_2 = await safe.signTransaction(txSigned_1);
    const { hash } = await safe.executeTransaction(txSigned_2);

    // Log the transaction hash
    console.log("transactionHash: ", hash);
    setIsTransactionPending(false);
    setDummyTransactionHash(hash);
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
          <p>Here you can deploy a 2 out of 3 Safe:</p>
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

      {selectedSafe && (
        <div className="mt-8">
          When you added the passkey as an owner, you can send a transaction:{" "}
          <br />
          <button
            onClick={handleSendTransaction}
            className="px-4 py-2 font-semibold text-white bg-neutral-800 rounded-lg"
          >
            Send Transaction
          </button>
        </div>
      )}

      {isTransactionPending && <p>Sending transaction...</p>}

      {dummyTransactionHash && (
        <div className="mt-8">
          <p>
            The transaction has been sent:{" "}
            <a
              href={`https://sepolia.etherscan.io/tx/${dummyTransactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-current text-blue-500 mb-4"
            >
              {dummyTransactionHash}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
