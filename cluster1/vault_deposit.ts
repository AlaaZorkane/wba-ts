import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  type Commitment,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, BN } from "@coral-xyz/anchor-new";
import type { Vault } from "./programs/idl/vault";
import IDL from "./programs/idl/vault.json";
import wallet from "../wba-wallet.json";

// Import our keypair from the wallet file
const owner = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(owner), {
  commitment,
});

// Create our program
const program = new Program<Vault>(IDL as Vault, provider);

const [statePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("state"), owner.publicKey.toBytes()],
  program.programId,
);

console.log(`Vault public key: ${statePda.toBase58()}`);

// Create the vault key
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), statePda.toBuffer()],
  SystemProgram.programId,
);

// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods
      .deposit(new BN(LAMPORTS_PER_SOL / 2))
      .accountsPartial({
        owner: owner.publicKey,
        state: statePda,
        vault: vaultPda,
      })
      .signers([owner])
      .rpc();
    console.log(
      `Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`,
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
