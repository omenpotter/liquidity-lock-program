use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("BLM1UpG3ZJQnini6sG3oqznTQnsZCCuPUaLDVHEH4Ka1");

#[program]
pub mod liquidity_lock_program {
    use super::*;

    pub fn initialize_lock(
        ctx: Context<InitializeLock>,
        amount: u64,
        unlock_timestamp: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(amount > 0, LockError::InvalidAmount);
        require!(unlock_timestamp > clock.unix_timestamp, LockError::InvalidUnlockTime);
        
        let lock = &mut ctx.accounts.lock;
        lock.authority = ctx.accounts.authority.key();
        lock.beneficiary = ctx.accounts.beneficiary.key();
        lock.token_mint = ctx.accounts.token_mint.key();
        lock.amount = amount;
        lock.unlock_timestamp = unlock_timestamp;
        lock.unlocked = false;
        lock.bump = ctx.bumps.lock;
        
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.lock_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        
        Ok(())
    }

    pub fn unlock(ctx: Context<Unlock>) -> Result<()> {
        let lock = &mut ctx.accounts.lock;
        let clock = Clock::get()?;
        
        require!(!lock.unlocked, LockError::AlreadyUnlocked);
        require!(clock.unix_timestamp >= lock.unlock_timestamp, LockError::StillLocked);
        
        let seeds = &[
            b"lock",
            lock.token_mint.as_ref(),
            lock.authority.as_ref(),
            &[lock.bump],
        ];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.lock_token_account.to_account_info(),
                    to: ctx.accounts.beneficiary_token_account.to_account_info(),
                    authority: lock.to_account_info(),
                },
                &[seeds],
            ),
            lock.amount,
        )?;
        
        lock.unlocked = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeLock<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1,
        seeds = [b"lock", token_mint.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub lock: Account<'info, TokenLock>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = lock,
    )]
    pub lock_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: Beneficiary
    pub beneficiary: AccountInfo<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Unlock<'info> {
    #[account(
        mut,
        seeds = [b"lock", lock.token_mint.as_ref(), lock.authority.as_ref()],
        bump = lock.bump,
    )]
    pub lock: Account<'info, TokenLock>,
    
    #[account(mut)]
    pub lock_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub beneficiary: Signer<'info>,
    
    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenLock {
    pub authority: Pubkey,
    pub beneficiary: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub unlock_timestamp: i64,
    pub unlocked: bool,
    pub bump: u8,
}

#[error_code]
pub enum LockError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid unlock time")]
    InvalidUnlockTime,
    #[msg("Still locked")]
    StillLocked,
    #[msg("Already unlocked")]
    AlreadyUnlocked,
}
