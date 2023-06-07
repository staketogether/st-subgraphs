import { BigInt } from '@graphprotocol/graph-ts'
import { loadAccount, loadStakeTogether } from './hooks'

export const zeroAccount = '0x0000000000000000000000000000000000000000'
export const contractAddress = '0x1b09577cb94906c0f2119a1c61919f6f055cbc74'

export function poolBalance(): BigInt {
  let st = loadStakeTogether()

  if (st.contractBalance.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(1)
  }

  return st.contractBalance.minus(st.liquidityBufferBalance)
}

export function balanceOf(accountId: string): BigInt {
  let account = loadAccount(accountId)
  return pooledEthByShares(account.shares)
}

export function withdrawalsBalance(): BigInt {
  let st = loadStakeTogether()

  return poolBalance().plus(st.liquidityBufferBalance)
}

export function totalPooledEther(): BigInt {
  let st = loadStakeTogether()

  const total = st.contractBalance
    .plus(st.transientBalance)
    .plus(st.beaconBalance)
    .minus(st.liquidityBufferBalance)

  return total
}

export function totalSupply(): BigInt {
  return totalPooledEther()
}

export function pooledEthByShares(sharesAmount: BigInt): BigInt {
  let st = loadStakeTogether()

  const amount = sharesAmount.times(st.totalPooledEther).div(st.totalShares)

  return amount
}
