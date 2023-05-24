import { BigInt } from '@graphprotocol/graph-ts'
import {
  Bootstrap,
  CommunityAdded,
  CommunityRemoved,
  Deposit,
  Withdraw
} from '../generated/StakeTogether/StakeTogether'
import { Account, Community, Delegation, StakeTogether } from '../generated/schema'

export function handleBootstrap(event: Bootstrap): void {
  let st = new StakeTogether('st')

  st.totalEth = event.params.balance
  st.totalShares = event.params.balance
  st.totalDelegatedShares = event.params.balance

  st.blockNumber = event.block.number
  st.blockTimestamp = event.block.timestamp
  st.transactionHash = event.transaction.hash

  st.save()
}

export function handleCommunityAdded(event: CommunityAdded): void {
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
  }
  community.st = 'st'
  community.address = event.params.account
  community.active = true
  community.delegatedShares = BigInt.fromI32(0)

  community.blockNumber = event.block.number
  community.blockTimestamp = event.block.timestamp
  community.transactionHash = event.transaction.hash

  community.save()
}

export function handleCommunityRemoved(event: CommunityRemoved): void {
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
    account.balance = event.params.amount
    account.shares = event.params.shares
    account.blockNumber = event.block.number
    account.blockTimestamp = event.block.timestamp
    account.transactionHash = event.transaction.hash
    account.save()
  } else {
    account.balance = account.balance.plus(event.params.amount)
    account.shares = account.shares.plus(event.params.shares)
    account.save()
  }
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
  let account = Account.load(accountId)
  if (account != null) {
    account.balance = account.balance.minus(event.params.amount)
    account.shares = account.shares.minus(event.params.shares)
    account.save()
  }
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
}
