import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  type Commitment,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  type Address,
  BN,
} from "@coral-xyz/anchor";
import { type WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "finalized";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

const PROGRAM_ID = "vLtGiWe6zK8rx3fuRXrm5er2EccAr4XpjssYNEJDLBH" as Address;

// Create our program
const program = new Program<WbaVault>(IDL, PROGRAM_ID as Address, provider);

const vaultState = new PublicKey("<address>");

// Create the PDA for our enrollment account
const [vaultAuth] = PublicKey.findProgramAddressSync(
  [Buffer.from("auth"), vaultState.toBuffer()],
  SystemProgram.programId,
);

// Create the vault key
const [vault] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), vaultAuth.toBuffer()],
  program.programId,
);

// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods
      .deposit(new BN(LAMPORTS_PER_SOL))
      .accounts({
        owner: keypair.publicKey,
        vault,
        vaultState,
        vaultAuth,
      })
      .signers([keypair])
      .rpc();
    console.log(
      `Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`,
    );
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
