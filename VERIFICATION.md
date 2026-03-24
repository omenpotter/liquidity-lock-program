# Build Verification Guide

This guide helps others verify that the deployed program matches the published source code.

## Prerequisites

- Ubuntu 24.04 or similar
- Rust nightly
- Anchor CLI 0.32.1
- Solana CLI 3.1.11

## Installation
```bash
# Install Rust nightly
rustup install nightly
rustup override set nightly

# Install Anchor 0.32.1
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --locked --force

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
```

## Build Steps
```bash
# Clone repository
git clone https://github.com/yourproject/liquidity-lock
cd liquidity-lock

# Build
anchor build

# Get program hash
solana program dump BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1 deployed.so
sha256sum deployed.so
sha256sum target/deploy/liquidity_lock_program.so

# Hashes should match!
```

## Deployed Program

- **Program ID**: BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1
- **Network**: X1 Mainnet (https://rpc.mainnet.x1.xyz)
- **Deployment Slot**: 38,375,644
- **Size**: 261,408 bytes

## Verification Status

✅ Source code published
✅ Build instructions provided
⏳ Independent verification pending
⏳ Professional audit pending
