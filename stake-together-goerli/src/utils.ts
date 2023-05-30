import { BigInt } from '@graphprotocol/graph-ts'
import { StakeTogether } from '../generated/schema'

export function poolBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return st.contractBalance.minus(st.liquidityBufferBalance).minus(st.validatorBufferBalance)
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
