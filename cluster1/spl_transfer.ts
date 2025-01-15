import {
  type Commitment,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import wallet from "../wba-wallet.json";
import {
  getOrCreateAssociatedTokenAccount,
  transferChecked,
} from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const receiver = Keypair.generate();

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("H5EZ71DGXL6NjG6LAinjze6aACQAK9j3Nbdo7r6j7HLr");

// Recipient address
const to = receiver.publicKey;

const tokenDecimals = 1_000_000n;

(async () => {
  try {
    const receiverAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to,
    );
    console.log(`Receiver ATA: ${receiverAta.address.toBase58()}`);
    const senderAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
    );
    console.log(`Sender ATA: ${senderAta.address.toBase58()}`);

    const transferTx = await transferChecked(
      connection,
      keypair,
      senderAta.address,
      mint,
      receiverAta.address,
      keypair,
      1n * tokenDecimals,
      6,
    );
    console.log(`Transfer txid: ${transferTx}`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
