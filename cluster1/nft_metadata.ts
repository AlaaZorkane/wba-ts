import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import type { JsonMetadata } from "@metaplex-foundation/mpl-token-metadata";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
  try {
    const metadata: JsonMetadata = {
      name: "stoopid cat",
      symbol: "stoopid",
      description: "From a very smart cat, comes a very stoopid cat.",
      image:
        "https://devnet.irys.xyz/EZN69HhW2F8DayG3mySDDWqwxerGCUHhDQAdCP1ud4av",
      attributes: [
        // biome-ignore lint/style/useNamingConvention: based on library
        { trait_type: "stupidity", value: "very stoopid" },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://devnet.irys.xyz/EZN69HhW2F8DayG3mySDDWqwxerGCUHhDQAdCP1ud4av",
          },
        ],
        creators: [
          {
            address: keypair.publicKey,
            share: 100,
          },
        ],
      },
    };

    const myUri = await umi.uploader.uploadJson(metadata);

    console.log("Your metadata URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
