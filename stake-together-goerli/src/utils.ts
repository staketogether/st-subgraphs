import { BigInt } from '@graphprotocol/graph-ts'
import { Account, StakeTogether } from '../generated/schema'

export const zeroAccount = '0x0000000000000000000000000000000000000000'

export function poolBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return st.contractBalance.minus(st.liquidityBufferBalance).minus(st.validatorBufferBalance)
  }
}

export function accountBalance(accountId: string): BigInt {
  let account = Account.load(accountId)

  if (account === null) {
    return BigInt.fromI32(0)
  } else {
    return account.shares
  }
}

export function poolBufferBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return poolBalance().plus(st.validatorBufferBalance)
  }
}

export function withdrawalsBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return poolBalance().plus(st.liquidityBufferBalance)
  }
}

export function totalPooledEther(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(1)
  } else {
    return st.contractBalance
      .plus(st.transientBalance)
      .plus(st.beaconBalance)
      .minus(st.liquidityBufferBalance)
      .minus(st.validatorBufferBalance)
  }
}

export function totalSupply(): BigInt {
  return totalPooledEther()
}

export function pooledEthByShares(sharesAmount: BigInt): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(1)
  } else {
    return sharesAmount.times(totalPooledEther()).div(st.totalShares)
  }
}
