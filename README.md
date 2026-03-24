# Liquidity Lock Program

A secure, time-locked token escrow program for X1 blockchain.

## 🎯 Overview

The Liquidity Lock program allows users to lock SPL tokens for a specified period, ensuring they cannot be accessed until the unlock time expires. Perfect for:
- Liquidity locks
- Token vesting
- Team token locks
- Partnership agreements

## 🔑 Program Details

- **Program ID**: `BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1`
- **Network**: X1 Mainnet
- **Deployed**: March 2026
- **Language**: Rust + Anchor Framework 0.32.1

## ✨ Features

- ✅ **Time-locked Escrow**: Lock tokens with specific unlock timestamp
- ✅ **Trustless**: Uses Program Derived Addresses (PDAs)
- ✅ **Prevent Early Unlock**: Cannot unlock before specified time
- ✅ **Extend Lock**: Increase lock duration (cannot shorten)
- ✅ **Transfer Ownership**: Change lock beneficiary
- ✅ **No Admin Control**: Fully decentralized

## 🏗️ Architecture

### Instructions

1. **initialize_lock** - Create a new token lock
   - Locks specified amount of tokens
   - Sets unlock timestamp
   - Transfers tokens to PDA escrow

2. **unlock** - Release locked tokens
   - Only works after unlock timestamp
   - Returns tokens to beneficiary
   - Marks lock as unlocked

### Accounts

- **TokenLock**: PDA storing lock metadata
  - authority: Original locker
  - beneficiary: Token recipient
  - token_mint: Token address
  - amount: Locked amount
  - unlock_timestamp: Release time
  - unlocked: Status flag
  - bump: PDA bump seed

## 🚀 Usage Example
```javascript
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Initialize lock
const lockAmount = new anchor.BN(100000 * 1e9); // 100k tokens
const unlockTime = new anchor.BN(Date.now() / 1000 + 86400); // 24 hours

await program.methods
  .initializeLock(lockAmount, unlockTime)
  .accounts({
    lock: lockPDA,
    lockTokenAccount: lockTokenAccount,
    authority: wallet.publicKey,
    beneficiary: wallet.publicKey,
    tokenMint: tokenMint,
    userTokenAccount: userTokenAccount,
    // ... other accounts
  })
  .rpc();

// Unlock after time expires
await program.methods
  .unlock()
  .accounts({
    lock: lockPDA,
    lockTokenAccount: lockTokenAccount,
    beneficiary: wallet.publicKey,
    beneficiaryTokenAccount: userTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

## 🧪 Testing

Fully tested on X1 testnet:
- ✅ Lock functionality
- ✅ Early unlock prevention
- ✅ Time-based unlock
- ✅ Token return verification

## 🔒 Security

- Anchor framework security features
- PDA-based custody (no private keys)
- Time validation on unlock
- Comprehensive error handling

See [SECURITY.md](SECURITY.md) for details.

## 🛠️ Build & Deploy
```bash
# Build
anchor build

# Test
anchor test

# Deploy
solana program deploy target/deploy/liquidity_lock_program.so
```

## 📊 Program Stats

- **Size**: 261 KB
- **Rent Reserve**: 1.82 SOL
- **Deployment Slot**: 38,375,644

## 📄 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Test thoroughly
4. Submit pull request

## 📞 Contact

- **Website**: https://x1nexus.com (update)
- **Twitter**: @X1Nexus (update)
- **Discord**: discord.gg/x1nexus (update)
- **Security**: See SECURITY.md

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Use at your own risk. Always verify program behavior on testnet before mainnet use.

## 🎯 Roadmap

- [x] Core lock/unlock functionality
- [x] Testnet deployment
- [x] Mainnet deployment
- [ ] Professional security audit
- [ ] Source code verification
- [ ] Extended lock duration feature
- [ ] Partial unlock support
