import { BigInt } from '@graphprotocol/graph-ts'
import {
  AddPool,
  Bootstrap,
  BurnDelegatedShares,
  BurnShares,
  DepositLiquidityBuffer,
  DepositPool,
  DepositValidatorBuffer,
  MintDelegatedShares,
  MintOperatorRewards,
  MintPoolRewards,
  MintStakeTogetherRewards,
  RemovePool,
  SetBeaconBalance,
  SetOperatorFeeAddress,
  SetStakeTogetherFeeAddress,
  SetTransientBalance,
  TransferShares,
  WithdrawLiquidityBuffer,
  WithdrawPool,
  WithdrawValidatorBuffer
} from '../generated/StakeTogether/StakeTogether'
import { loadAccount, loadDelegation, loadPool, loadStakeTogether, syncStakeTogether } from './hooks'
import { balanceOf, contractAddress } from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = loadStakeTogether()
  st.contractBalance = event.params.balance
  st.operatorFeeAddress = event.params.sender.toHexString()
  st.stakeTogetherFeeAddress = event.params.sender.toHexString()
  st.save()
  syncStakeTogether()
}

export function handleAddPool(event: AddPool): void {
  // Account  -------------------------------------
  let accountId = event.params.account.toHexString()
  loadAccount(accountId)
  // Pool -----------------------------------
  loadPool(accountId)
}

export function handleRemovePool(event: RemovePool): void {
  // Pool -----------------------------------
  let poolId = event.params.account.toHexString()
  let pool = loadPool(poolId)
  pool.active = false
  pool.save()
}

export function handleDepositLiquidityBuffer(event: DepositLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.liquidityBufferBalance = st.liquidityBufferBalance.plus(event.params.amount)
  st.save()
  syncStakeTogether()
}

export function handleWithdrawLiquidityBuffer(event: WithdrawLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.liquidityBufferBalance = st.liquidityBufferBalance.minus(event.params.amount)
  st.save()
  syncStakeTogether()
}

export function handleDepositValidatorBuffer(event: DepositValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.validatorBufferBalance = st.validatorBufferBalance.plus(event.params.amount)
  st.save()
  syncStakeTogether()
}

export function handleWithdrawValidatorBuffer(event: WithdrawValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.validatorBufferBalance = st.validatorBufferBalance.minus(event.params.amount)
  st.save()
  syncStakeTogether()
}

export function handleDepositPool(event: DepositPool): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.save()
  syncStakeTogether()

  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = loadAccount(accountId)
  account.depositBalance = account.depositBalance.plus(event.params.amount)
  account.save()
}

export function handleWithdrawPool(event: WithdrawPool): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.save()
  syncStakeTogether()

  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = loadAccount(accountId)
  account.withdrawBalance = account.withdrawBalance.plus(event.params.amount)
  account.save()
}

export function handleMintShares(event: TransferShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalShares = st.totalShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  // Account To -----------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = loadAccount(accountToId)
  accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
  accountTo.save()

  accountTo.originalBalance = accountTo.depositBalance.minus(accountTo.withdrawBalance)
  accountTo.currentBalance = balanceOf(accountToId)
  accountTo.rewardsBalance = accountTo.currentBalance.minus(accountTo.originalBalance)
  accountTo.save()
}

export function handleTransferShares(event: TransferShares): void {
  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()

  let accountFrom = loadAccount(accountFromId)
  accountFrom.shares = accountFrom.shares.minus(event.params.sharesAmount)
  accountFrom.save()
  accountFrom.originalBalance = accountFrom.depositBalance.minus(accountFrom.withdrawBalance)
  accountFrom.currentBalance = balanceOf(accountFromId)
  accountFrom.rewardsBalance = accountFrom.currentBalance.minus(accountFrom.originalBalance)
  accountFrom.save()

  // Account To -----------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = loadAccount(accountToId)
  accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
  accountTo.save()
  accountTo.originalBalance = accountTo.depositBalance.minus(accountTo.withdrawBalance)
  accountTo.currentBalance = balanceOf(accountToId)
  accountTo.rewardsBalance = accountTo.currentBalance.minus(accountTo.originalBalance)
  accountTo.save()
}

export function handleBurnShares(event: BurnShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalShares = st.totalShares.minus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = loadAccount(accountId)
  account.shares = account.shares.minus(event.params.sharesAmount)
  account.save()

  account.originalBalance = account.depositBalance.minus(account.withdrawBalance)
  account.currentBalance = balanceOf(accountId)
  account.rewardsBalance = account.currentBalance.minus(account.originalBalance)
  account.save()
}

export function handleMintDelegatedShares(event: MintDelegatedShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  if (event.params.delegated.toHexString() == contractAddress) {
    return
  }

  // Pool -----------------------------------
  let poolId = event.params.delegated.toHexString()
  let pool = loadPool(poolId)
  pool.delegatedShares = pool.delegatedShares.plus(event.params.sharesAmount)
  pool.save()

  // Delegation -------------------------------------
  let accountToId = event.params.to.toHexString()
  let delegation = loadDelegation(accountToId, poolId)
  delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
  delegation.save()
}

export function handleBurnDelegatedShares(event: BurnDelegatedShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalDelegatedShares = st.totalDelegatedShares.minus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  if (event.params.delegated.toHexString() == contractAddress) {
    return
  }

  // Pool -----------------------------------
  let poolId = event.params.delegated.toHexString()
  let pool = loadPool(poolId)
  pool.delegatedShares = pool.delegatedShares.minus(event.params.sharesAmount)
  pool.save()

  // Delegation -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = loadAccount(accountFromId)
  let delegation = loadDelegation(accountFromId, poolId)
  delegation.delegationShares = delegation.delegationShares.minus(event.params.sharesAmount)
  delegation.save()

  if (delegation.delegationShares.le(BigInt.fromI32(0))) {
    if (pool.receivedDelegationsCount.gt(BigInt.fromI32(0))) {
      pool.receivedDelegationsCount = pool.receivedDelegationsCount.minus(BigInt.fromI32(1))
      pool.save()
    }
    if (accountFrom.sentDelegationsCount.gt(BigInt.fromI32(0))) {
      accountFrom.sentDelegationsCount = accountFrom.sentDelegationsCount.minus(BigInt.fromI32(1))
      accountFrom.save()
    }
  }
}

export function handleMintOperatorRewards(event: MintOperatorRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalOperatorRewardsShares = st.totalOperatorRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()
}

export function handleMintStakeTogetherRewards(event: MintStakeTogetherRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalStakeTogetherRewardsShares = st.totalStakeTogetherRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()
}

export function handleMintPoolRewards(event: MintPoolRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalPoolRewardsShares = st.totalPoolRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  // Pool -----------------------------------
  let poolId = event.params.to.toHexString()
  let pool = loadPool(poolId)
  pool.rewardsShares = pool.rewardsShares.plus(event.params.sharesAmount)
  pool.save()
}

export function handleSetTransientBalance(event: SetTransientBalance): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.transientBalance = event.params.amount
  st.save()
  syncStakeTogether()
}

export function handleSetBeaconBalance(event: SetBeaconBalance): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.beaconBalance = event.params.amount
  st.save()
  syncStakeTogether()
}

export function handleSetOperatorFeeAddress(event: SetOperatorFeeAddress): void {
  let st = loadStakeTogether()
  st.operatorFeeAddress = event.params.to.toHexString()
  st.save()
  syncStakeTogether()
}

export function handleSetStakeTogetherFeeAddress(event: SetStakeTogetherFeeAddress): void {
  let st = loadStakeTogether()
  st.stakeTogetherFeeAddress = event.params.to.toHexString()
  st.save()
  syncStakeTogether()
}
