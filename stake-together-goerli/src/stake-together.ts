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
import { Account, Community, Delegation, StakeTogether } from '../generated/schema'
import {
  balanceOf,
  poolBalance,
  poolBufferBalance,
  totalPooledEther,
  totalSupply,
  withdrawalsBalance,
  zeroAccount
} from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = new StakeTogether('st')

  st.contractBalance = event.params.balance
  st.beaconBalance = BigInt.fromI32(0)
  st.transientBalance = BigInt.fromI32(0)
  st.liquidityBufferBalance = BigInt.fromI32(0)
  st.validatorBufferBalance = BigInt.fromI32(0)

  st.poolBalance = event.params.balance
  st.poolBufferBalance = BigInt.fromI32(0)
  st.withdrawalsBalance = BigInt.fromI32(0)

  st.totalPooledEther = event.params.balance
  st.totalSupply = event.params.balance

  st.totalShares = event.params.balance
  st.totalDelegatedShares = event.params.balance
  st.totalRewardsShares = BigInt.fromI32(0)

  st.save()
}

export function handleAddCommunity(event: AddCommunity): void {
  // Account  -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account === null) {
    account = new Account(accountId)
    account.st = 'st'
    account.address = event.params.account
    account.shares = BigInt.fromI32(0)
    account.balance = BigInt.fromI32(0)
    account.rewardsShares = BigInt.fromI32(0)
    account.save()
  }
  // Community -----------------------------------
  let id = event.params.account.toHexString()
  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
    community.st = 'st'
    community.address = event.params.account
    community.delegatedShares = BigInt.fromI32(0)
    community.rewardsShares = BigInt.fromI32(0)
    community.active = true
    community.save()
  } else {
    community.active = true
    community.save()
  }
}

export function handleRemoveCommunity(event: RemoveCommunity): void {
  // Community -----------------------------------
  let id = event.params.account.toHexString()
  let community = Community.load(id)
  if (community !== null) {
    community.active = false
    community.save()
  }
}

export function handleDepositLiquidityBuffer(event: DepositLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.plus(event.params.amount)
    st.liquidityBufferBalance = st.liquidityBufferBalance.plus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleWithdrawLiquidityBuffer(event: WithdrawLiquidityBuffer): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.minus(event.params.amount)
    st.liquidityBufferBalance = st.liquidityBufferBalance.minus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleDepositValidatorBuffer(event: DepositValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.plus(event.params.amount)
    st.validatorBufferBalance = st.validatorBufferBalance.plus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleWithdrawValidatorBuffer(event: WithdrawValidatorBuffer): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.minus(event.params.amount)
    st.validatorBufferBalance = st.validatorBufferBalance.minus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleDepositPool(event: DepositPool): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account === null) {
    account = new Account(accountId)
    account.st = 'st'
    account.address = event.params.account
    account.shares = BigInt.fromI32(0)
    account.balance = BigInt.fromI32(0)
    account.rewardsShares = BigInt.fromI32(0)
    account.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.plus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleWithdrawPool(event: WithdrawPool): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.contractBalance = st.contractBalance.minus(event.params.amount)
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleTransferShares(event: TransferShares): void {
  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = Account.load(accountFromId)
  if (accountFrom === null) {
    if (!accountFromId.includes(zeroAccount)) {
      accountFrom = new Account(accountFromId)
      accountFrom.st = 'st'
      accountFrom.address = event.params.from
      accountFrom.shares = BigInt.fromI32(0)
      accountFrom.balance = BigInt.fromI32(0)
      accountFrom.rewardsShares = BigInt.fromI32(0)
      accountFrom.save()
    }
  } else {
    if (accountFrom.shares.gt(event.params.sharesAmount)) {
      accountFrom.shares = accountFrom.shares.minus(event.params.sharesAmount)
      accountFrom.save()
      accountFrom.balance = balanceOf(accountFromId)
      accountFrom.save()
    }
  }
  // Account To -----------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = Account.load(accountToId)
  if (accountTo === null) {
    accountTo = new Account(accountToId)
    accountTo.st = 'st'
    accountTo.address = event.params.to
    accountTo.shares = event.params.sharesAmount
    accountTo.rewardsShares = BigInt.fromI32(0)
    accountTo.save()
    accountTo.balance = balanceOf(accountToId)
    accountTo.save()
  } else {
    accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
    accountTo.save()
    accountTo.balance = balanceOf(accountToId)
    accountTo.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalShares = st.totalShares.plus(event.params.sharesAmount)
    st.save()
  }
}

export function handleBurnShares(event: BurnShares): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account !== null) {
    account.shares = account.shares.minus(event.params.sharesAmount)
    account.save()
    account.balance = balanceOf(accountId)
    account.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalShares = st.totalShares.minus(event.params.sharesAmount)
    st.save()
  }
}

export function handleTransferDelegatedShares(event: TransferDelegatedShares): void {
  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = Community.load(communityId)
  if (community !== null) {
    community.delegatedShares = community.delegatedShares.plus(event.params.sharesAmount)
    community.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.sharesAmount)
    st.save()
  }
  // Delegation -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountToId = event.params.to.toHexString()
  let delegationId = `${accountFromId}-${accountToId}`
  let delegation = Delegation.load(delegationId)
  if (delegation === null) {
    delegation = new Delegation(delegationId)
    delegation.st = 'st'
    delegation.delegate = accountFromId
    delegation.delegated = accountToId
    delegation.delegationShares = event.params.sharesAmount
    delegation.save()
  } else {
    delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
    delegation.save()
  }
}

export function handleBurnDelegatedShares(event: BurnDelegatedShares): void {
  // Community -----------------------------------
  let communityId = event.params.delegate.toHexString()
  let community = Community.load(communityId)
  if (community !== null) {
    community.delegatedShares = community.delegatedShares.minus(event.params.sharesAmount)
    community.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalDelegatedShares = st.totalDelegatedShares.minus(event.params.sharesAmount)
    st.save()
  }
  // Delegation -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountToId = event.params.delegate.toHexString()
  let delegationId = `${accountFromId}-${accountToId}`
  let delegation = Delegation.load(delegationId)
  if (delegation !== null) {
    delegation.delegationShares = delegation.delegationShares.minus(event.params.sharesAmount)
    delegation.save()
  }
}

export function handleTransferRewardsShares(event: TransferRewardsShares): void {
  // Community -----------------------------------
  let communityId = event.params.to.toHexString()
  let community = Community.load(communityId)
  if (community !== null) {
    community.rewardsShares = community.rewardsShares.plus(event.params.sharesAmount)
    community.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
    st.save()
  }

  // Todo: Implement Stake Together Rewards
  // Todo: Implement Operator Rewards
}

export function handleSetTransientBalance(event: SetTransientBalance): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.transientBalance = event.params.amount
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}

export function handleSetBeaconBalance(event: SetBeaconBalance): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.beaconBalance = event.params.amount
    st.save()
    st.poolBalance = poolBalance()
    st.poolBufferBalance = poolBufferBalance()
    st.withdrawalsBalance = withdrawalsBalance()
    st.totalPooledEther = totalPooledEther()
    st.totalSupply = totalSupply()
    st.save()
  }
}
