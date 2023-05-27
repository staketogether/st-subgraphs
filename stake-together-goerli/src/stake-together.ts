import { BigInt } from '@graphprotocol/graph-ts'
import {
  AddCommunity,
  Bootstrap,
  BurnDelegatedShares,
  BurnShares,
  DepositPool,
  RemoveCommunity,
  SetConsensusLayerBalance,
  TransferDelegatedShares,
  TransferRewardsShares,
  TransferShares,
  WithdrawPool
} from '../generated/StakeTogether/StakeTogether'
import { Account, Community, Delegation, StakeTogether } from '../generated/schema'
import { getPooledEthByShares, getTotalPooledEther } from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = new StakeTogether('st')

  st.ethBalance = event.params.balance
  st.clBalance = BigInt.fromI32(0)
  st.trBalance = BigInt.fromI32(0)
  st.withdrawalsBalance = BigInt.fromI32(0)

  st.totalShares = event.params.balance
  st.totalDelegatedShares = event.params.balance
  st.totalRewardsShares = BigInt.fromI32(0)

  st.totalSharesEther = event.params.balance
  st.totalDelegatedSharesEther = event.params.balance
  st.totalRewardsSharesEther = BigInt.fromI32(0)

  st.totalPooledEther = event.params.balance
  st.totalSupply = event.params.balance

  st.blockNumber = event.block.number
  st.blockTimestamp = event.block.timestamp
  st.transactionHash = event.transaction.hash

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
    account.delegatedShares = BigInt.fromI32(0)
    account.rewardsShares = BigInt.fromI32(0)
    account.blockNumber = event.block.number
    account.blockTimestamp = event.block.timestamp
    account.transactionHash = event.transaction.hash
    account.save()
  }

  // Community -----------------------------------
  let id = event.params.account.toHexString()
  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
    community.st = 'st'
    community.address = event.params.account
    community.account = event.params.account.toHexString()
    community.active = true
    community.blockNumber = event.block.number
    community.blockTimestamp = event.block.timestamp
    community.transactionHash = event.transaction.hash
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
  if (community != null) {
    community.active = false
    community.save()
  }
}

export function handleDepositPool(event: DepositPool): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  // Delegation ----------------------------------
  let communityId = event.params.delegated.toHexString()
  let delegationId = `${accountId}-${communityId}`
  let delegation = Delegation.load(delegationId)
  if (delegation == null) {
    if (account != null) {
      delegation = new Delegation(delegationId)
      delegation.st = 'st'
      delegation.delegate = accountId
      delegation.delegated = communityId
      delegation.delegationShares = event.params.shares
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.delegationShares = delegation.delegationShares.plus(event.params.shares)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.ethBalance = st.ethBalance.plus(event.params.amount)
    st.save()
    st.totalPooledEther = getTotalPooledEther()
    st.totalSupply = st.totalPooledEther
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
}

export function handleWithdrawPool(event: WithdrawPool): void {
  // Account ------------------------------------
  let accountId = event.params.account.toHexString()
  let delegatedId = event.params.delegated.toHexString()

  // Delegation ----------------------------------
  let delegationId = `${accountId}-${delegatedId}}`
  let delegation = Delegation.load(delegationId)
  if (delegation != null) {
    delegation.delegationShares = delegation.delegationShares.minus(event.params.shares)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.ethBalance = st.ethBalance.minus(event.params.amount)
    st.save()
    st.totalPooledEther = getTotalPooledEther()
    st.totalSupply = st.totalPooledEther
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
}

export function handleTransferRewardsShares(event: TransferRewardsShares): void {
  // Account -------------------------------------
  let accountId = event.params.to.toHexString()
  let account = Account.load(accountId)
  if (account !== null) {
    account.rewardsShares = account.rewardsShares.plus(event.params.sharesAmount)
    account.save()
  }
  // Delegation -------------------------------------
  let delegationId = `${accountId}-${accountId}`
  let delegation = Delegation.load(delegationId)
  if (delegation == null) {
    if (account != null) {
      delegation = new Delegation(delegationId)
      delegation.st = 'st'
      delegation.delegate = accountId
      delegation.delegated = accountId
      delegation.delegationShares = event.params.sharesAmount
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.totalRewardsShares = st.totalRewardsShares.plus(event.params.sharesAmount)
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
}

export function handleSetConsensusLayerBalance(event: SetConsensusLayerBalance): void {
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.clBalance = event.params.amount
    st.save()
    st.totalPooledEther = getTotalPooledEther()
    st.totalSupply = st.totalPooledEther
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
}

export function handleTransferShares(event: TransferShares): void {
  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = Account.load(accountFromId)
  if (accountFrom === null) {
    accountFrom = new Account(accountFromId)
    accountFrom.st = 'st'
    accountFrom.address = event.params.from
    accountFrom.shares = BigInt.fromI32(0)
    accountFrom.delegatedShares = BigInt.fromI32(0)
    accountFrom.rewardsShares = BigInt.fromI32(0)
    accountFrom.blockNumber = event.block.number
    accountFrom.blockTimestamp = event.block.timestamp
    accountFrom.transactionHash = event.transaction.hash
    accountFrom.save()
  } else {
    if (accountFrom.shares > BigInt.fromI32(0)) {
      accountFrom.shares = accountFrom.shares.minus(event.params.sharesAmount)
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
    accountTo.delegatedShares = BigInt.fromI32(0)
    accountTo.rewardsShares = BigInt.fromI32(0)
    accountTo.blockNumber = event.block.number
    accountTo.blockTimestamp = event.block.timestamp
    accountTo.transactionHash = event.transaction.hash
    accountTo.save()
  } else {
    accountTo.shares = accountTo.shares.plus(event.params.sharesAmount)
    accountTo.save()
  }

  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalShares = st.totalShares.plus(event.params.sharesAmount)
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
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
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.totalShares = st.totalShares.minus(event.params.sharesAmount)
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
}

export function handleTransferDelegatedShares(event: TransferDelegatedShares): void {
  // Account From -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = Account.load(accountFromId)
  if (accountFrom === null) {
    accountFrom = new Account(accountFromId)
    accountFrom.st = 'st'
    accountFrom.address = event.params.from
    accountFrom.shares = BigInt.fromI32(0)
    accountFrom.delegatedShares = BigInt.fromI32(0)
    accountFrom.rewardsShares = BigInt.fromI32(0)
    accountFrom.blockNumber = event.block.number
    accountFrom.blockTimestamp = event.block.timestamp
    accountFrom.transactionHash = event.transaction.hash
    accountFrom.save()
  } else {
    if (accountFrom.delegatedShares > BigInt.fromI32(0)) {
      accountFrom.delegatedShares = accountFrom.delegatedShares.minus(event.params.sharesAmount)
      accountFrom.save()
    }
  }
  // Account To -------------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = Account.load(accountToId)
  if (accountTo === null) {
    accountTo = new Account(accountToId)
    accountTo.st = 'st'
    accountTo.address = event.params.to
    accountTo.shares = BigInt.fromI32(0)
    accountTo.delegatedShares = event.params.sharesAmount
    accountFrom.rewardsShares = BigInt.fromI32(0)
    accountTo.blockNumber = event.block.number
    accountTo.blockTimestamp = event.block.timestamp
    accountTo.transactionHash = event.transaction.hash
    accountTo.save()
  } else {
    accountTo.delegatedShares = accountTo.delegatedShares.plus(event.params.sharesAmount)
    accountTo.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.sharesAmount)
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
  // Delegation -------------------------------------
  let delegationId = `${accountFromId}-${accountToId}`
  let delegation = Delegation.load(delegationId)
  if (delegation === null) {
    if (accountFrom !== null && accountTo !== null) {
      delegation = new Delegation(delegationId)
      delegation.st = 'st'
      delegation.delegate = accountFromId
      delegation.delegated = accountToId
      delegation.delegationShares = event.params.sharesAmount
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
    delegation.save()
  }
}

export function handleBurnDelegatedShares(event: BurnDelegatedShares): void {
  // Account -------------------------------------
  let accountFromId = event.params.from.toHexString()
  let accountFrom = Account.load(accountFromId)
  if (accountFrom !== null) {
    accountFrom.delegatedShares = accountFrom.delegatedShares.minus(event.params.sharesAmount)
    accountFrom.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st !== null) {
    st.totalDelegatedShares = st.totalDelegatedShares.minus(event.params.sharesAmount)
    st.totalSharesEther = getPooledEthByShares(st.totalShares)
    st.totalDelegatedSharesEther = getPooledEthByShares(st.totalDelegatedShares)
    st.totalRewardsSharesEther = getPooledEthByShares(st.totalRewardsShares)
    st.save()
  }
  // Delegation -------------------------------------
  let accountDelegateId = event.params.delegate.toHexString()
  let delegationId = `${accountFromId}-${accountDelegateId}`
  let delegation = Delegation.load(delegationId)
  if (delegation !== null) {
    delegation.delegationShares = delegation.delegationShares.plus(event.params.sharesAmount)
    delegation.save()
  }
}
