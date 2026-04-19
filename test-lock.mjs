import { Connection, PublicKey, Keypair, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { readFileSync } from 'fs';
import BN from 'bn.js';

const conn = new Connection('https://rpc.mainnet.x1.xyz', 'confirmed');
const wallet = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync('/home/projectsx1/.config/solana/mainnet-wallet.json', 'utf8')))
);

const LOCK_PROGRAM_ID = new PublicKey('BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1');
const TOKEN_MINT = new PublicKey('8rEyCjXJy7G8ph4Gdz7ZM14zfwwqcfFgggmNoxRMwZ2z');

const [lockPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('lock'), TOKEN_MINT.toBuffer(), wallet.publicKey.toBuffer()],
  LOCK_PROGRAM_ID
);
const lockTokenAccountKp = Keypair.generate();
const userTokenAccount = await getAssociatedTokenAddress(
  TOKEN_MINT, wallet.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
);

const bal = await conn.getTokenAccountBalance(userTokenAccount);
console.log('Balance:', bal.value.uiAmount, 'decimals:', bal.value.decimals);
console.log('Lock PDA:', lockPDA.toString());
console.log('Lock token account:', lockTokenAccountKp.publicKey.toString());

const decimals = bal.value.decimals;
const LOCK_AMOUNT = new BN(100 * Math.pow(10, decimals));
const UNLOCK_TS = new BN(Math.floor(Date.now() / 1000) + 300); // 5 minutes for testing

console.log('Locking 100 tokens for 5 minutes...');

const INIT_LOCK_DISC = Buffer.from([182, 214, 195, 105, 58, 73, 81, 124]);
const data = Buffer.alloc(8 + 8 + 8);
INIT_LOCK_DISC.copy(data, 0);
LOCK_AMOUNT.toArrayLike(Buffer, 'le', 8).copy(data, 8);
UNLOCK_TS.toArrayLike(Buffer, 'le', 8).copy(data, 16);

const ix = new TransactionInstruction({
  programId: LOCK_PROGRAM_ID,
  keys: [
    { pubkey: lockPDA, isSigner: false, isWritable: true },
    { pubkey: lockTokenAccountKp.publicKey, isSigner: true, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
    { pubkey: TOKEN_MINT, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ],
  data,
});

const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
const tx = new Transaction({ recentBlockhash: blockhash, feePayer: wallet.publicKey }).add(ix);
tx.sign(wallet, lockTokenAccountKp);

const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
console.log('TX sent:', sig);
await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
console.log('✅ Locked! Unlock at:', new Date((Math.floor(Date.now()/1000) + 300) * 1000).toISOString());
console.log('Lock token account (save this):', lockTokenAccountKp.publicKey.toString());
