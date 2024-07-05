"use client";

import Image from "next/image";
import { OWNER_1_PRIVATE_KEY, OWNER_1_PUBLIC_KEY } from "./keys";
import SafeApiKit from "@safe-global/api-kit";
import { useEffect } from "react";
import { useState } from "react";
import { SafeFactory } from "@safe-global/protocol-kit";
import { RPC_URL } from "./config";

export default function Home() {
  const [safesOfOwner, setSafesOfOwner] = useState([]);
  const [isDeployingSafe, setIsDeployingSafe] = useState(false);

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
  };

  useEffect(() => {
    checkForDeployedSafes();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <p className=" left-0 top-0 flex border-b pb-6 pt-8 backdrop-blur-2xl border-neutral-800  from-inherit static w-auto  rounded-xl border p-4 bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
      </div>

      <div className="mt-16">
        {safesOfOwner?.map((safe, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center px-8 mb-4 border border-neutral-800 rounded-lg"
          >
            <p className="text-lg font-semibold">
              {index + 1}: {safe}
            </p>
          </div>
        ))}
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

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore starter templates for Next.js.
          </p>
        </a>
      </div>
    </main>
  );
}
