import { BigInt } from '@graphprotocol/graph-ts'
import {
  Bootstrap,
  CommunityAdded,
  CommunityRemoved,
  ConsensusLayerBalanceUpdated,
  Deposit,
  TransferRewards,
  Withdraw
} from '../generated/StakeTogether/StakeTogether'
import { Account, Community, Delegation, StakeTogether } from '../generated/schema'
import { getPooledEthByShares } from './utils'

export function handleBootstrap(event: Bootstrap): void {
  let st = new StakeTogether('st')

  st.ethBalance = event.params.balance
  st.clBalance = BigInt.fromI32(0)
  st.trBalance = BigInt.fromI32(0)
  st.withdrawalsBalance = BigInt.fromI32(0)

  st.totalShares = event.params.balance
  st.totalDelegatedShares = event.params.balance

  st.blockNumber = event.block.number
  st.blockTimestamp = event.block.timestamp
  st.transactionHash = event.transaction.hash

  st.save()
}

export function handleCommunityAdded(event: CommunityAdded): void {
  // Community -----------------------------------
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
  }
  community.st = 'st'
  community.address = event.params.account
  community.active = true
  community.delegatedShares = BigInt.fromI32(0)
  community.delegatedAmount = BigInt.fromI32(0)
  community.rewardsShares = BigInt.fromI32(0)
  community.rewardsAmount = BigInt.fromI32(0)

  community.blockNumber = event.block.number
  community.blockTimestamp = event.block.timestamp
  community.transactionHash = event.transaction.hash

  community.save()
}

export function handleCommunityRemoved(event: CommunityRemoved): void {
  // Community -----------------------------------
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community != null) {
    community.active = false
    community.save()
  }
}

export function handleDeposit(event: Deposit): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account == null) {
    account = new Account(accountId)
    account.st = 'st'
    account.address = event.params.account
    account.shares = event.params.shares
    account.amount = getPooledEthByShares(event.params.shares)
    account.blockNumber = event.block.number
    account.blockTimestamp = event.block.timestamp
    account.transactionHash = event.transaction.hash
    account.save()
  } else {
    account.shares = account.shares.plus(event.params.shares)
    account.amount = getPooledEthByShares(account.shares)
    account.save()
  }
  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = event.params.shares
    community.delegatedAmount = getPooledEthByShares(event.params.shares)
    community.save()
  }
  // Delegation ----------------------------------
  let delegationId = `${accountId}-${communityId}`
  let delegation = Delegation.load(delegationId)
  if (delegation == null) {
    if (account != null && community != null) {
      delegation = new Delegation(delegationId)
      delegation.st = 'st'
      delegation.delegator = account.address.toHexString()
      delegation.delegated = community.address.toHexString()
      delegation.shares = event.params.shares
      delegation.amount = getPooledEthByShares(event.params.shares)
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.shares = delegation.shares.plus(event.params.shares)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.ethBalance = st.ethBalance.plus(event.params.amount)
    st.totalShares = st.totalShares.plus(event.params.shares)
    st.totalDelegatedShares = st.totalDelegatedShares.plus(event.params.shares)
    st.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  // Account ------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account != null) {
    account.shares = account.shares.minus(event.params.shares)
    account.amount = getPooledEthByShares(account.shares)
    account.save()
  }
  // Community -----------------------------------
  let communityId = event.params.account.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = community.delegatedShares.minus(event.params.shares)
    community.delegatedAmount = getPooledEthByShares(community.delegatedShares)
    community.save()
  }
  // Delegation ----------------------------------
  let delegationId = `${accountId}-${communityId}}`
  let delegation = Delegation.load(delegationId)
  if (delegation != null) {
    delegation.shares = delegation.shares.minus(event.params.shares)
    delegation.amount = getPooledEthByShares(delegation.shares)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.ethBalance = st.ethBalance.minus(event.params.amount)
    st.totalShares = st.totalShares.minus(event.params.shares)
    st.totalDelegatedShares = st.totalDelegatedShares.minus(event.params.shares)
    st.save()
  }
}

export function handleTransferRewards(event: TransferRewards): void {
  // Community -----------------------------------
  let communityId = event.params.to.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = community.delegatedShares.plus(event.params.amount)
    community.delegatedAmount = getPooledEthByShares(community.delegatedShares)
    community.rewardsShares = community.rewardsShares.plus(event.params.amount)
    community.rewardsAmount = getPooledEthByShares(community.rewardsShares)
    community.save()
  }

  // Account -------------------------------------
  let accountId = event.params.to.toHexString()
  let account = Account.load(accountId)
  if (account == null) {
    account = new Account(accountId)
    account.st = 'st'
    account.address = event.params.to
    account.shares = event.params.amount
    account.amount = getPooledEthByShares(event.params.amount)
    account.blockNumber = event.block.number
    account.blockTimestamp = event.block.timestamp
    account.transactionHash = event.transaction.hash
    account.save()
  } else {
    account.shares = account.shares.plus(event.params.amount)
    account.amount = getPooledEthByShares(account.shares)
    account.save()
  }

  // Delegation -------------------------------------
  let delegationId = `${accountId}-${communityId}`
  let delegation = Delegation.load(delegationId)
  if (delegation == null) {
    if (account != null && community != null) {
      delegation = new Delegation(delegationId)
      delegation.st = 'st'
      delegation.delegator = account.address.toHexString()
      delegation.delegated = community.address.toHexString()
      delegation.shares = event.params.amount
      delegation.amount = getPooledEthByShares(event.params.amount)
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.shares = delegation.shares.plus(event.params.amount)
    delegation.amount = getPooledEthByShares(delegation.shares)
    delegation.save()
  }

  // StakeTogether ----------------------------------

  // Todo: map bootstrap fee recipient
  // Todo: Process fees for operators and stake together
}

export function handleConsensusLayerBalanceUpdated(event: ConsensusLayerBalanceUpdated): void {
  let st = StakeTogether.load('st')
  if (st != null) {
    st.clBalance = event.params._balance
    st.save()
  }
}
