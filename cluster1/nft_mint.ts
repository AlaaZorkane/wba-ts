import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json";
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
  const tx = createNft(umi, {
    mint,
    name: "stoopid cat",
    sellerFeeBasisPoints: percentAmount(0),
    uri: "https://devnet.irys.xyz/BLMYNYxCfmbmEtM77Mvub35NeuN64DgDahYfXtz5YZvy",
    authority: myKeypairSigner,
    updateAuthority: myKeypairSigner,
    primarySaleHappened: true,
    symbol: "stoopid",
    isMutable: true,
  });
  const result = await tx.sendAndConfirm(umi);
  const signature = base58.encode(result.signature);

  console.log(signature);

  console.log("Mint Address: ", mint.publicKey);
})();
