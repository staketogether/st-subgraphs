import { BigInt } from '@graphprotocol/graph-ts'
import { StakeTogether } from '../generated/schema'

export function bufferedBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return st.contractBalance.minus(st.liquidityBalance)
  }
}

export function extendedBufferedBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return bufferedBalance().plus(st.extendedBalance)
  }
}

export function withdrawalsBalance(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(0)
  } else {
    return bufferedBalance().minus(st.liquidityBalance)
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
      .minus(st.withdrawalsBalance)
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
