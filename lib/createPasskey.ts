import { PasskeyArgType, extractPasskeyData } from "@safe-global/protocol-kit";

const STORAGE_PASSKEY_VALUE_KEY = "passkey_safe_dev_digest";

/**
 * Retrieves an existing passkey or creates a new one if none exists.
 * @returns A promise that resolves to the passkey.
 */
export async function getOrCreatePasskey(): Promise<PasskeyArgType> {
  let passkey = loadPasskey();

  if (!passkey) {
    passkey = await createPasskey();
    storePasskey(passkey);
  }

  return passkey;
}

async function createPasskey(): Promise<PasskeyArgType> {
  // Generate a passkey credential using WebAuthn API
  // This is generic code on how to create a passkey credential and not Safe specific.
  const passkeyCredential = await navigator.credentials.create({
    publicKey: {
      pubKeyCredParams: [
        {
          // ECDSA w/ SHA-256: https://datatracker.ietf.org/doc/html/rfc8152#section-8.1
          // 4337 requires alg to be set to -7
          alg: -7,
          type: "public-key",
        },
      ],
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Safe SmartAccount",
      },
      user: {
        displayName: "Safe Demo Passkey",
        id: crypto.getRandomValues(new Uint8Array(32)),
        name: "safe-demo-passkey",
      },
      timeout: 60_000,
      attestation: "none",
    },
  });

  if (!passkeyCredential) {
    throw Error("Passkey creation failed: No credential was returned.");
  }

  const passkey = await extractPasskeyData(passkeyCredential);

  console.log("new passkey created: ", passkey);

  return passkey;
}

/**
 * Stores the passkey in the local storage.
 * @param passkey - The passkey to be stored.
 */
function storePasskey(passkey: PasskeyArgType): void {
  localStorage.setItem(STORAGE_PASSKEY_VALUE_KEY, JSON.stringify(passkey));
}

/**
 * Loads the passkey from the local storage.
 * @returns The passkey if it exists in the local storage, otherwise null.
 */
function loadPasskey(): PasskeyArgType | null {
  const passkeyStored = localStorage.getItem(STORAGE_PASSKEY_VALUE_KEY);

  if (passkeyStored) {
    const passkey = JSON.parse(passkeyStored);
    return passkey;
  }

  return null;
}
