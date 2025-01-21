import {
  Connection,
  Keypair,
  PublicKey,
  type Commitment,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  type Address,
} from "@coral-xyz/anchor";
import { type WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
import { SystemProgram } from "@solana/web3.js";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

const PROGRAM_ID = "vLtGiWe6zK8rx3fuRXrm5er2EccAr4XpjssYNEJDLBH" as Address;

// Create our program
const program = new Program<WbaVault>(IDL, PROGRAM_ID, provider);

// Create a random keypair
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const [vaultAuthPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("auth"), vaultState.publicKey.toBuffer()],
  SystemProgram.programId,
);

// Create the vault key
// Seeds are "vault", vaultAuth
const [vaultPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), vaultAuthPda.toBuffer()],
  program.programId,
);

// Execute our enrollment transaction
(async () => {
  try {
    const sig = await program.methods
      .initialize()
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth: vaultAuthPda,
        vault: vaultPda,
      })
      .signers([keypair, vaultState])
      .rpc();
    console.log(
      `Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${sig}?cluster=devnet`,
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
