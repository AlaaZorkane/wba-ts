import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "node:fs/promises";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    // 1. Load image
    const image = await readFile("./images/stoopidcat.png");
    // 2. Convert image to generic file.
    const genericFile = createGenericFile(image, "stoopidcat.png", {
      contentType: "image/png",
    });
    // 3. Upload image
    const [uri] = await umi.uploader.upload([genericFile]);
    console.log("Your image URI: ", uri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
