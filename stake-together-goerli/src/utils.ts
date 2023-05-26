import { BigInt } from '@graphprotocol/graph-ts'
import { StakeTogether } from '../generated/schema'

export function getTotalPooledEther(): BigInt {
  let st = StakeTogether.load('st')

  if (st !== null) {
    return st.clBalance.plus(st.ethBalance).minus(st.withdrawalsBalance)
  }

  throw new Error('StakeTogether not found')
}

export function getPooledEthByShares(sharesAmount: BigInt): BigInt {
  let st = StakeTogether.load('st')

  if (st !== null) {
    if (st.totalShares.equals(BigInt.fromI32(0))) {
      return BigInt.fromI32(0)
    }

    return sharesAmount.times(getTotalPooledEther()).div(st.totalShares)
  }

  throw new Error('StakeTogether not found')
}
