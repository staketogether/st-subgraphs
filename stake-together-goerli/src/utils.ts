import { BigInt, log } from '@graphprotocol/graph-ts'
import { loadAccount, loadStakeTogether } from './hooks'

export const zeroAccount = '0x0000000000000000000000000000000000000000'
export const contractAddress = '0x80d3d71594157fcb865dc230ab69d3ffa719de3a'

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

  log.warning('\n\n\n', [])
  log.warning('totalPooledEther: {}', [st.totalPooledEther.toString()])
  log.warning('sharesAmount: {}', [sharesAmount.toString()])
  log.warning('totalShares: {}', [st.totalShares.toString()])
  log.warning('\n\n\n', [])

  const amount = sharesAmount.times(st.totalPooledEther).div(st.totalShares)

  return amount
}
