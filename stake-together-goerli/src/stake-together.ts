import { BigInt, log } from '@graphprotocol/graph-ts'
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
  SetOperatorFeeRecipient,
  SetStakeTogetherFeeRecipient,
  SetTransientBalance,
  TransferCommunityRewards,
  TransferDelegatedShares,
  TransferOperatorRewards,
  TransferShares,
  TransferStakeTogetherRewards,
  WithdrawLiquidityBuffer,
  WithdrawPool,
  WithdrawValidatorBuffer
} from '../generated/StakeTogether/StakeTogether'
import { loadAccount, loadCommunity, loadDelegation, loadStakeTogether, syncStakeTogether } from './hooks'
import { balanceOf, contractAddress, zeroAccount } from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = loadStakeTogether()
  st.contractBalance = event.params.balance
  st.operatorFeeRecipient = event.params.sender.toHexString()
  st.stakeTogetherFeeRecipient = event.params.sender.toHexString()
  st.save()
  syncStakeTogether()
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

export function handleTransferShares(event: TransferShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalShares = st.totalShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()
  if (!accountFromId.includes(zeroAccount)) {
    let accountFrom = loadAccount(accountFromId)
    accountFrom.shares = accountFrom.shares.minus(event.params.sharesAmount)
    accountFrom.save()

    accountFrom.originalBalance = accountFrom.depositBalance.minus(accountFrom.withdrawBalance)
    accountFrom.currentBalance = balanceOf(accountFromId)
    accountFrom.rewardsBalance = accountFrom.currentBalance.minus(accountFrom.originalBalance)
    accountFrom.save()
  }

  // Account To -----------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = loadAccount(accountToId)
  accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
  accountTo.save()

  accountTo.originalBalance = accountTo.depositBalance.minus(accountTo.withdrawBalance)
  accountTo.currentBalance = balanceOf(accountToId)
  accountTo.rewardsBalance = accountTo.currentBalance.minus(accountTo.originalBalance)
  accountTo.save()

  log.warning('\n\n\n\n ORIGINAL_BALANCE: {}\n\n\n\n', [accountTo.originalBalance.toString()])
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

export function handleTransferDelegatedShares(event: TransferDelegatedShares): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  if (event.params.delegated.toHexString() == contractAddress) {
    return
  }

  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = loadCommunity(communityId)
  community.delegatedShares = community.delegatedShares.plus(event.params.sharesAmount)
  community.save()

  // Delegation -------------------------------------
  let accountToId = event.params.to.toHexString()
  let delegation = loadDelegation(accountToId, communityId)
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

  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = loadCommunity(communityId)
  community.delegatedShares = community.delegatedShares.minus(event.params.sharesAmount)
  community.save()

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
}

export function handleTransferCommunityRewards(event: TransferCommunityRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalCommunityRewardsShares = st.totalCommunityRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()

  // Community -----------------------------------
  let communityId = event.params.to.toHexString()
  let community = loadCommunity(communityId)
  community.rewardsShares = community.rewardsShares.plus(event.params.sharesAmount)
  community.save()
}

export function handleTransferOperatorRewards(event: TransferOperatorRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalOperatorRewardsShares = st.totalOperatorRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()
}

export function handleTransferStakeTogetherRewards(event: TransferStakeTogetherRewards): void {
  // StakeTogether -------------------------------------
  let st = loadStakeTogether()
  st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
  st.totalStakeTogetherRewardsShares = st.totalStakeTogetherRewardsShares.plus(event.params.sharesAmount)
  st.save()
  syncStakeTogether()
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

export function handleSetOperatorFeeRecipient(event: SetOperatorFeeRecipient): void {
  let st = loadStakeTogether()
  st.operatorFeeRecipient = event.params.to.toHexString()
  st.save()
  syncStakeTogether()
}

export function handleSetStakeTogetherFeeRecipient(event: SetStakeTogetherFeeRecipient): void {
  let st = loadStakeTogether()
  st.stakeTogetherFeeRecipient = event.params.to.toHexString()
  st.save()
  syncStakeTogether()
}
