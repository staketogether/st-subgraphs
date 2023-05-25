import { BigInt } from '@graphprotocol/graph-ts'
import {
  Bootstrap,
  CommunityAdded,
  CommunityRemoved,
  ConsensusLayerBalanceUpdated,
  Deposit,
  SharesBurnt,
  TransferRewards,
  TransferShares,
  Withdraw
} from '../generated/StakeTogether/StakeTogether'
import { Account, Community, Delegation, StakeTogether } from '../generated/schema'

export function handleBootstrap(event: Bootstrap): void {
  let st = new StakeTogether('st')

  st.ethBalance = event.params.balance
  st.clBalance = BigInt.fromI32(0)
  st.trBalance = BigInt.fromI32(0)
  st.withdrawalsBalance = BigInt.fromI32(0)

  st.totalShares = event.params.balance
  st.totalDelegatedShares = event.params.balance
  st.totalPooledEther = BigInt.fromI32(0)
  st.totalSupply = BigInt.fromI32(0)

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
  community.rewardsShares = BigInt.fromI32(0)
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
  // Community -----------------------------------
  let communityId = event.params.delegated.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = event.params.shares
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
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.shares = delegation.shares.plus(event.params.shares)
    delegation.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  // Account ------------------------------------
  let accountId = event.params.account.toHexString()

  // Community -----------------------------------
  let communityId = event.params.account.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = community.delegatedShares.minus(event.params.shares)
    community.save()
  }
  // Delegation ----------------------------------
  let delegationId = `${accountId}-${communityId}}`
  let delegation = Delegation.load(delegationId)
  if (delegation != null) {
    delegation.shares = delegation.shares.minus(event.params.shares)
    delegation.save()
  }
  // StakeTogether ----------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.ethBalance = st.ethBalance.minus(event.params.amount)
    st.save()
  }
}

export function handleTransferRewards(event: TransferRewards): void {
  // Community -----------------------------------
  let communityId = event.params.to.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = community.delegatedShares.plus(event.params.amount)
    community.rewardsShares = community.rewardsShares.plus(event.params.amount)
    community.save()
  }

  // Account -------------------------------------
  let accountId = event.params.to.toHexString()
  let account = Account.load(accountId)

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
      delegation.blockNumber = event.block.number
      delegation.blockTimestamp = event.block.timestamp
      delegation.transactionHash = event.transaction.hash
      delegation.save()
    }
  } else {
    delegation.shares = delegation.shares.plus(event.params.amount)
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

export function handleTransferShares(event: TransferShares): void {
  // Account -------------------------------------
  let accountToId = event.params.to.toHexString()
  let accountTo = Account.load(accountToId)
  if (accountTo == null) {
    accountTo = new Account(accountToId)
    accountTo.st = 'st'
    accountTo.address = event.params.to
    accountTo.shares = event.params.sharesValue
    accountTo.blockNumber = event.block.number
    accountTo.blockTimestamp = event.block.timestamp
    accountTo.transactionHash = event.transaction.hash
    accountTo.save()
  } else {
    accountTo.shares = accountTo.shares.plus(event.params.sharesValue)
    accountTo.save()
  }

  let accountFromId = event.params.from.toHexString()
  let accountFrom = Account.load(accountFromId)
  if (accountFrom == null) {
    accountFrom = new Account(accountFromId)
    accountFrom.st = 'st'
    accountFrom.address = event.params.to
    accountFrom.shares = BigInt.fromI32(0)
    accountFrom.blockNumber = event.block.number
    accountFrom.blockTimestamp = event.block.timestamp
    accountFrom.transactionHash = event.transaction.hash
    accountFrom.save()
  } else {
    accountFrom.shares = accountTo.shares.minus(event.params.sharesValue)
    accountFrom.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.totalShares = st.totalShares.plus(event.params.sharesValue)
    st.save()
  }
}

export function handleSharesBurnt(event: SharesBurnt): void {
  // Account -------------------------------------
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account != null) {
    account.shares = account.shares.minus(event.params.sharesAmount)
    account.save()
  }
  // StakeTogether -------------------------------------
  let st = StakeTogether.load('st')
  if (st != null) {
    st.totalShares = st.totalShares.minus(event.params.sharesAmount)
    st.save()
  }
}
