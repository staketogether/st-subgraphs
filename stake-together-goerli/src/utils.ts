import { BigInt } from '@graphprotocol/graph-ts'
import { StakeTogether } from '../generated/schema'

export function getTotalPooledEther(): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(1)
  } else {
    return st.clBalance.plus(st.ethBalance).minus(st.withdrawalsBalance)
  }
}

export function getPooledEthByShares(sharesAmount: BigInt): BigInt {
  let st = StakeTogether.load('st')

  if (st === null) {
    return BigInt.fromI32(1)
  } else {
    if (st.totalShares.equals(BigInt.fromI32(0))) {
      return BigInt.fromI32(0)
    }

    return sharesAmount.times(getTotalPooledEther()).div(st.totalShares)
  }
}
