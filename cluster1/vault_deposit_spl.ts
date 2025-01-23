import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  type Commitment,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, BN } from "@coral-xyz/anchor-new";
import type { Vault } from "./programs/idl/vault";
import IDL from "./programs/idl/vault.json";
import wallet from "../wba-wallet.json";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

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


// Mint address (legacy token)
const mint = new PublicKey("8T3z6dtBMcz2yMdU7umJaeckfW1o1VAgUupftcSki13M");

// Mint address (token2022)
// const mint = new PublicKey("9AHHitbbyvg3LfGTHPiGgp2fJyVgJ1csqszbh2xUuB86");

// Execute our enrollment transaction
(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      owner.publicKey,
      false,
    );
    // Get the token account of the fromWallet address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      vaultPda,
      true,
    );
    const signature = await program.methods
    .depositSpl(new BN(<number>))
    .accounts({
      tokenMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID
    })
    .signers([
        keypair
    ]).rpc();
    // console.log(`Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
