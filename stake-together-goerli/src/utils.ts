import { BigInt } from '@graphprotocol/graph-ts'
import { loadAccount, loadStakeTogether } from './hooks'

export const zeroAccount = '0x0000000000000000000000000000000000000000'
export const contractAddress = '0xc34bab05746f4ba8dfb489a0c2a8cdc2c34eda74'

export function poolBalance(): BigInt {
  let st = loadStakeTogether()

  if (st.contractBalance.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(1)
  }

  return st.contractBalance.minus(st.liquidityBufferBalance).minus(st.validatorBufferBalance)
}

export function balanceOf(accountId: string): BigInt {
  let account = loadAccount(accountId)
  return pooledEthByShares(account.shares)
}

export function poolBufferBalance(): BigInt {
  let st = loadStakeTogether()

  return poolBalance().plus(st.validatorBufferBalance)
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
    .minus(st.validatorBufferBalance)

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
