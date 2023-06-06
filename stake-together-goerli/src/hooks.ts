import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Delegation, Pool, StakeTogether } from '../generated/schema'
import {
  poolBalance,
  poolBufferBalance,
  totalPooledEther,
  totalSupply,
  withdrawalsBalance
} from './utils'

export function loadStakeTogether(): StakeTogether {
  let st = StakeTogether.load('st')

  if (st === null) {
    st = new StakeTogether('st')
    st.contractBalance = BigInt.fromI32(0)
    st.beaconBalance = BigInt.fromI32(0)
    st.transientBalance = BigInt.fromI32(0)
    st.liquidityBufferBalance = BigInt.fromI32(0)
    st.validatorBufferBalance = BigInt.fromI32(0)

    st.poolBalance = BigInt.fromI32(0)
    st.poolBufferBalance = BigInt.fromI32(0)
    st.withdrawalsBalance = BigInt.fromI32(0)

    st.totalPooledEther = BigInt.fromI32(0)
    st.totalSupply = BigInt.fromI32(0)

    st.totalShares = BigInt.fromI32(0)
    st.totalDelegatedShares = BigInt.fromI32(0)
    st.totalRewardsShares = BigInt.fromI32(0)

    st.stakeTogetherFeeAddress = ''
    st.operatorFeeAddress = ''

    st.totalPoolRewardsShares = BigInt.fromI32(0)
    st.totalOperatorRewardsShares = BigInt.fromI32(0)
    st.totalStakeTogetherRewardsShares = BigInt.fromI32(0)

    st.save()
    return st
  }

  return st
}

export function syncStakeTogether(): StakeTogether {
  let st = loadStakeTogether()
  st.poolBalance = poolBalance()
  st.poolBufferBalance = poolBufferBalance()
  st.withdrawalsBalance = withdrawalsBalance()
  st.totalPooledEther = totalPooledEther()
  st.totalSupply = totalSupply()
  st.save()
  return st
}

export function loadAccount(id: string): Account {
  let account = Account.load(id)
  if (account === null) {
    account = new Account(id)
    account.st = 'st'
    account.address = id
    account.shares = BigInt.fromI32(0)
    account.sentDelegationsCount = BigInt.fromI32(0)
    account.rewardsShares = BigInt.fromI32(0)

    account.depositBalance = BigInt.fromI32(0)
    account.withdrawBalance = BigInt.fromI32(0)
    account.originalBalance = BigInt.fromI32(0)
    account.currentBalance = BigInt.fromI32(0)
    account.rewardsBalance = BigInt.fromI32(0)

    account.save()
    return account
  }
  return account
}

export function loadPool(id: string): Pool {
  let pool = Pool.load(id)
  if (pool == null) {
    pool = new Pool(id)
    pool.st = 'st'
    pool.address = id
    pool.receivedDelegationsCount = BigInt.fromI32(0)
    pool.delegatedShares = BigInt.fromI32(0)

    pool.rewardsShares = BigInt.fromI32(0)
    pool.active = true
    pool.save()
  }
  return pool
}

export function loadDelegation(accountId: string, poolId: string): Delegation {
  const id = `${accountId}-${poolId}`
  let delegation = Delegation.load(id)
  if (delegation === null) {
    delegation = new Delegation(id)
    delegation.st = 'st'
    delegation.delegate = accountId
    delegation.delegated = poolId
    delegation.delegationShares = BigInt.fromI32(0)
    delegation.save()

    let account = loadAccount(accountId)
    let pool = loadPool(poolId)

    account.sentDelegationsCount = account.sentDelegationsCount.plus(BigInt.fromI32(1))
    account.save()

    pool.receivedDelegationsCount = pool.receivedDelegationsCount.plus(BigInt.fromI32(1))
    pool.save()
  }
  return delegation
}
