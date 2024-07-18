This repository contains code that compliments the Safe Developer Digest Episode 2, where you learn how to add a passkey
as a signer to an already existing safe.

It was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Keys

You can generate your own private and public keys with the following command. Please charge the accounts with Sepolia 
Eth before you try to send a transaction.

```bash
npm run initPrivateKeys
# or
yarn initPrivateKeys
# or
pnpm initPrivateKeys
# or
bun initPrivateKeys
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
