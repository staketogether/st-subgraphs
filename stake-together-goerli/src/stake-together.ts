import { BigInt } from '@graphprotocol/graph-ts'
import {
  AddCommunity,
  Bootstrap,
  BurnDelegatedShares,
  BurnShares,
  DepositLiquidityBuffer,
  DepositPool,
  DepositValidatorBuffer,
  RemoveCommunity,
  SetBeaconBalance,
  SetTransientBalance,
  TransferDelegatedShares,
  TransferRewardsShares,
  TransferShares,
  WithdrawLiquidityBuffer,
  WithdrawPool,
  WithdrawValidatorBuffer
} from '../generated/StakeTogether/StakeTogether'
import {
  loadAccount,
  loadCommunity,
  loadDelegation,
  loadStakeTogether,
  updateAccount,
  updateCommunity,
  updateStakeTogether
} from './hooks'
import { zeroAccount } from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = loadStakeTogether()
  st.contractBalance = event.params.balance
  st.poolBalance = event.params.balance
  st.poolBufferBalance = event.params.balance
  st.withdrawalsBalance = event.params.balance
  st.totalPooledEther = event.params.balance
  st.totalSupply = event.params.balance
  st.save()
}

export function handleAddCommunity(event: AddCommunity): void {
  // Account  -------------------------------------
  let accountId = event.params.account.toHexString()
  loadAccount(accountId)
  // Community -----------------------------------
  loadCommunity(accountId)
}

export function handleRemoveCommunity(event: RemoveCommunity): void {
  // Community -----------------------------------
  let communityId = event.params.account.toHexString()
  let community = loadCommunity(communityId)
  community.active = false
  community.save()
  updateCommunity(communityId)
}

export function handleDepositLiquidityBuffer(event: DepositLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.liquidityBufferBalance = st.liquidityBufferBalance.plus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleWithdrawLiquidityBuffer(event: WithdrawLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.liquidityBufferBalance = st.liquidityBufferBalance.minus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleDepositValidatorBuffer(event: DepositValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.validatorBufferBalance = st.validatorBufferBalance.plus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleWithdrawValidatorBuffer(event: WithdrawValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.validatorBufferBalance = st.validatorBufferBalance.minus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleDepositPool(event: DepositPool): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  loadAccount(accountId)

  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.plus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleWithdrawPool(event: WithdrawPool): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.contractBalance = st.contractBalance.minus(event.params.amount)
  st.save()
  updateStakeTogether()
}

export function handleTransferShares(event: TransferShares): void {
  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()
  if (!accountFromId.includes(zeroAccount)) {
    let accountFrom = loadAccount(accountFromId)
    accountFrom.shares = accountFrom.shares.minus(event.params.sharesAmount)
    accountFrom.save()
    updateAccount(accountFromId)
  }

  // Account To -----------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = loadAccount(accountToId)
  accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
  accountTo.save()
  updateAccount(accountToId)

  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalShares = st.totalShares.plus(event.params.sharesAmount)
  st.save()
  updateStakeTogether()
}

export function handleBurnShares(event: BurnShares): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = loadAccount(accountId)
  account.shares = account.shares.minus(event.params.sharesAmount)
  account.save()
  updateAccount(accountId)

  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalShares = st.totalShares.minus(event.params.sharesAmount)
  st.save()
  updateStakeTogether()
}

export function handleTransferDelegatedShares(event: TransferDelegatedShares): void {
  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = loadCommunity(communityId)
  community.delegatedShares = community.delegatedShares.plus(event.params.sharesAmount)
  community.save()
  updateCommunity(communityId)

  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.sharesAmount)
  st.save()
  updateStakeTogether()

  // Delegation -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountToId = event.params.to.toHexString()
  let delegation = loadDelegation(accountFromId, accountToId)
  delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
  delegation.save()
}

export function handleBurnDelegatedShares(event: BurnDelegatedShares): void {
  // Community -----------------------------------
  let communityId = event.params.delegate.toHexString()
  let community = loadCommunity(communityId)
  community.delegatedShares = community.delegatedShares.minus(event.params.sharesAmount)
  community.save()
  updateCommunity(communityId)

  // Delegation -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = loadAccount(accountFromId)
  let delegation = loadDelegation(accountFromId, communityId)

  delegation.delegationShares = delegation.delegationShares.minus(event.params.sharesAmount)
  delegation.save()

  if (delegation.delegationShares.le(BigInt.fromI32(0))) {
    if (community.receivedDelegationsCount.gt(BigInt.fromI32(0))) {
      community.receivedDelegationsCount = community.receivedDelegationsCount.minus(BigInt.fromI32(1))
      community.save()
    }
    if (accountFrom.sentDelegationsCount.gt(BigInt.fromI32(0))) {
      accountFrom.sentDelegationsCount = accountFrom.sentDelegationsCount.minus(BigInt.fromI32(1))
      accountFrom.save()
    }
  }

  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalDelegatedShares = st.totalDelegatedShares.minus(event.params.sharesAmount)
  st.save()
  updateStakeTogether()
}

export function handleTransferRewardsShares(event: TransferRewardsShares): void {
  // Community -----------------------------------
  let communityId = event.params.to.toHexString()
  let community = loadCommunity(communityId)
  community.rewardsShares = community.rewardsShares.plus(event.params.sharesAmount)
  community.save()
  updateCommunity(communityId)

  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.save()
  updateStakeTogether()

  // Todo: Implement Stake Together Rewards
  // Todo: Implement Operator Rewards
}

export function handleSetTransientBalance(event: SetTransientBalance): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.transientBalance = event.params.amount
  st.save()
  updateStakeTogether()
}

export function handleSetBeaconBalance(event: SetBeaconBalance): void {
  // StakeTogether ----------------------------------
  let st = loadStakeTogether()
  st.beaconBalance = event.params.amount
  st.save()
  updateStakeTogether()
}
