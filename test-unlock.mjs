import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { readFileSync } from 'fs';

const conn = new Connection('https://rpc.mainnet.x1.xyz', 'confirmed');
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync('/home/projectsx1/.config/solana/mainnet-wallet.json', 'utf8')))
);

const LOCK_PROGRAM_ID = new PublicKey('BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1');
const TOKEN_MINT = new PublicKey('8rEyCjXJy7G8ph4Gdz7ZM14zfwwqcfFgggmNoxRMwZ2z');
const LOCK_TOKEN_ACCOUNT = new PublicKey('C1nUCiARx93sUREPT7DBCpTjtzwvKTg7hGKDQb51G6dW');

const [lockPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('lock'), TOKEN_MINT.toBuffer(), wallet.publicKey.toBuffer()],
  LOCK_PROGRAM_ID
);

const beneficiaryTokenAccount = await getAssociatedTokenAddress(
  TOKEN_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
);

console.log('Lock PDA:', lockPDA.toString());
console.log('Beneficiary token account:', beneficiaryTokenAccount.toString());

const UNLOCK_DISC = Buffer.from([101, 155, 40, 21, 158, 189, 56, 203]);

const ix = new TransactionInstruction({
  programId: LOCK_PROGRAM_ID,
  keys: [
    { pubkey: lockPDA, isSigner: false, isWritable: true },
    { pubkey: LOCK_TOKEN_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: beneficiaryTokenAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ],
  data: UNLOCK_DISC,
});

const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey }).add(ix);
tx.sign(wallet);

const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
console.log('TX sent:', sig);
await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
console.log('✅ Unlocked! 100 tokens returned to wallet');
