import { BigInt } from '@graphprotocol/graph-ts'
import {
  CommunityAdded,
  CommunityRemoved,
  Deposit,
  Withdraw
} from '../generated/StakeTogether/StakeTogether'
import { Account, Community } from '../generated/schema'

export function handleCommunityAdded(event: CommunityAdded): void {
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
  }
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
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account == null) {
    account = new Account(accountId)
    account.address = event.params.account
    account.balance = event.params.amount
    account.shares = event.params.shares
    account.blockNumber = event.block.number
    account.blockTimestamp = event.block.timestamp
    account.transactionHash = event.transaction.hash
    account.save()
  } else {
  }
  // --------------------------------------------
  let communityId = event.params.account.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = event.params.shares
    community.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  let accountId = event.params.account.toHexString()
  let account = Account.load(accountId)
  if (account != null) {
    account.balance = account.balance.minus(event.params.amount)
    account.shares = account.shares.minus(event.params.shares)

    account.save()
  }
  // --------------------------------------------
  let communityId = event.params.account.toHexString()
  let community = Community.load(communityId)
  if (community != null) {
    community.delegatedShares = community.delegatedShares.minus(event.params.shares)
    community.save()
  }
}
