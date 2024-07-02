// Import necessary modules using ES module syntax
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { writeFileSync } from "fs";

// Function to generate keys and write to a file
function initPrivateKeys() {
  let keysContent = "";
  for (let i = 1; i < 4; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey); // Replace or modify based on actual method
    keysContent += `export const OWNER_${i}_PRIVATE_KEY = "${privateKey}";\n`;
    keysContent += `export const OWNER_${i}_PUBLIC_KEY = "${account.address}";\n`;
  }

  // Write the keys to keys.js
  writeFileSync("keys.js", keysContent);
}

// Call the function to generate and save the keys
initPrivateKeys();
