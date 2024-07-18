import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { writeFileSync } from "fs";

function main() {
  let keysContent = "";
  for (let i = 1; i < 4; i++) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey); // Replace or modify based on actual method
    keysContent += `export const OWNER_${i}_PRIVATE_KEY = "${privateKey}";\n`;
    keysContent += `export const OWNER_${i}_PUBLIC_KEY = "${account.address}";\n`;
  }

  writeFileSync("app/keys.js", keysContent);
}

main();
