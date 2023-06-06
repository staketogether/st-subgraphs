import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import {
  Approval,
  BufferDeposited,
  BufferWithdrawn,
  BurnDelegatedShares,
  ConsensusLayerBalanceUpdated,
  Deposit,
  EIP712DomainChanged,
  OwnershipTransferred,
  Paused,
  PoolAdded,
  PoolRemoved,
  ProcessRewards,
  Referral,
  SharesBurnt,
  Transfer,
  TransferDelegatedShares,
  TransferShares,
  Unpaused,
  Withdraw
} from '../generated/StakeTogether/StakeTogether'

export function createApprovalEvent(owner: Address, spender: Address, value: BigInt): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner)))
  approvalEvent.parameters.push(new ethereum.EventParam('spender', ethereum.Value.fromAddress(spender)))
  approvalEvent.parameters.push(
    new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createBufferDepositedEvent(account: Address, amount: BigInt): BufferDeposited {
  let bufferDepositedEvent = changetype<BufferDeposited>(newMockEvent())

  bufferDepositedEvent.parameters = new Array()

  bufferDepositedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )
  bufferDepositedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bufferDepositedEvent
}

export function createBufferWithdrawnEvent(account: Address, amount: BigInt): BufferWithdrawn {
  let bufferWithdrawnEvent = changetype<BufferWithdrawn>(newMockEvent())

  bufferWithdrawnEvent.parameters = new Array()

  bufferWithdrawnEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )
  bufferWithdrawnEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return bufferWithdrawnEvent
}

export function createBurnDelegatedSharesEvent(
  from: Address,
  delegate: Address,
  sharesAmount: BigInt,
  preDelegatedShares: BigInt,
  postDelegatedShares: BigInt,
  preTotalDelegatedShares: BigInt,
  postTotalDelegatedShares: BigInt
): BurnDelegatedShares {
  let burnDelegatedSharesEvent = changetype<BurnDelegatedShares>(newMockEvent())

  burnDelegatedSharesEvent.parameters = new Array()

  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('delegate', ethereum.Value.fromAddress(delegate))
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('sharesAmount', ethereum.Value.fromUnsignedBigInt(sharesAmount))
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('preDelegatedShares', ethereum.Value.fromUnsignedBigInt(preDelegatedShares))
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('postDelegatedShares', ethereum.Value.fromUnsignedBigInt(postDelegatedShares))
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam(
      'preTotalDelegatedShares',
      ethereum.Value.fromUnsignedBigInt(preTotalDelegatedShares)
    )
  )
  burnDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam(
      'postTotalDelegatedShares',
      ethereum.Value.fromUnsignedBigInt(postTotalDelegatedShares)
    )
  )

  return burnDelegatedSharesEvent
}

export function createPoolAddedEvent(account: Address): PoolAdded {
  let poolAddedEvent = changetype<PoolAdded>(newMockEvent())

  poolAddedEvent.parameters = new Array()

  poolAddedEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))

  return poolAddedEvent
}

export function createPoolRemovedEvent(account: Address): PoolRemoved {
  let poolRemovedEvent = changetype<PoolRemoved>(newMockEvent())

  poolRemovedEvent.parameters = new Array()

  poolRemovedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return poolRemovedEvent
}

export function createConsensusLayerBalanceUpdatedEvent(balance: BigInt): ConsensusLayerBalanceUpdated {
  let consensusLayerBalanceUpdatedEvent = changetype<ConsensusLayerBalanceUpdated>(newMockEvent())

  consensusLayerBalanceUpdatedEvent.parameters = new Array()

  consensusLayerBalanceUpdatedEvent.parameters.push(
    new ethereum.EventParam('balance', ethereum.Value.fromUnsignedBigInt(balance))
  )

  return consensusLayerBalanceUpdatedEvent
}

export function createDepositEvent(account: Address, amount: BigInt): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))
  depositEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return depositEvent
}

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam('previousOwner', ethereum.Value.fromAddress(previousOwner))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))

  return pausedEvent
}

export function createProcessRewardsEvent(
  preClBalance: BigInt,
  posClBalance: BigInt,
  rewards: BigInt,
  growthFactor: BigInt,
  stakeTogetherFee: BigInt,
  operatorFee: BigInt,
  poolFee: BigInt,
  stakeTogetherFeeShares: BigInt,
  operatorFeeShares: BigInt,
  poolFeeShares: BigInt
): ProcessRewards {
  let processRewardsEvent = changetype<ProcessRewards>(newMockEvent())

  processRewardsEvent.parameters = new Array()

  processRewardsEvent.parameters.push(
    new ethereum.EventParam('preClBalance', ethereum.Value.fromUnsignedBigInt(preClBalance))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('posClBalance', ethereum.Value.fromUnsignedBigInt(posClBalance))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('rewards', ethereum.Value.fromUnsignedBigInt(rewards))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('growthFactor', ethereum.Value.fromUnsignedBigInt(growthFactor))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('stakeTogetherFee', ethereum.Value.fromUnsignedBigInt(stakeTogetherFee))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('operatorFee', ethereum.Value.fromUnsignedBigInt(operatorFee))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('poolFee', ethereum.Value.fromUnsignedBigInt(poolFee))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam(
      'stakeTogetherFeeShares',
      ethereum.Value.fromUnsignedBigInt(stakeTogetherFeeShares)
    )
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('operatorFeeShares', ethereum.Value.fromUnsignedBigInt(operatorFeeShares))
  )
  processRewardsEvent.parameters.push(
    new ethereum.EventParam('poolFeeShares', ethereum.Value.fromUnsignedBigInt(poolFeeShares))
  )

  return processRewardsEvent
}

export function createReferralEvent(
  account: Address,
  delegated: Address,
  referral: Address,
  amount: BigInt
): Referral {
  let referralEvent = changetype<Referral>(newMockEvent())

  referralEvent.parameters = new Array()

  referralEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))
  referralEvent.parameters.push(
    new ethereum.EventParam('delegated', ethereum.Value.fromAddress(delegated))
  )
  referralEvent.parameters.push(new ethereum.EventParam('referral', ethereum.Value.fromAddress(referral)))
  referralEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return referralEvent
}

export function createSharesBurntEvent(
  account: Address,
  preRebaseTokenAmount: BigInt,
  postRebaseTokenAmount: BigInt,
  sharesAmount: BigInt
): SharesBurnt {
  let sharesBurntEvent = changetype<SharesBurnt>(newMockEvent())

  sharesBurntEvent.parameters = new Array()

  sharesBurntEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )
  sharesBurntEvent.parameters.push(
    new ethereum.EventParam(
      'preRebaseTokenAmount',
      ethereum.Value.fromUnsignedBigInt(preRebaseTokenAmount)
    )
  )
  sharesBurntEvent.parameters.push(
    new ethereum.EventParam(
      'postRebaseTokenAmount',
      ethereum.Value.fromUnsignedBigInt(postRebaseTokenAmount)
    )
  )
  sharesBurntEvent.parameters.push(
    new ethereum.EventParam('sharesAmount', ethereum.Value.fromUnsignedBigInt(sharesAmount))
  )

  return sharesBurntEvent
}

export function createTransferEvent(from: Address, to: Address, value: BigInt): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(new ethereum.EventParam('from', ethereum.Value.fromAddress(from)))
  transferEvent.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)))
  transferEvent.parameters.push(
    new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createTransferDelegatedSharesEvent(
  from: Address,
  to: Address,
  delegate: Address,
  sharesValue: BigInt
): TransferDelegatedShares {
  let transferDelegatedSharesEvent = changetype<TransferDelegatedShares>(newMockEvent())

  transferDelegatedSharesEvent.parameters = new Array()

  transferDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  transferDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  )
  transferDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('delegate', ethereum.Value.fromAddress(delegate))
  )
  transferDelegatedSharesEvent.parameters.push(
    new ethereum.EventParam('sharesValue', ethereum.Value.fromUnsignedBigInt(sharesValue))
  )

  return transferDelegatedSharesEvent
}

export function createTransferSharesEvent(
  from: Address,
  to: Address,
  sharesValue: BigInt
): TransferShares {
  let transferSharesEvent = changetype<TransferShares>(newMockEvent())

  transferSharesEvent.parameters = new Array()

  transferSharesEvent.parameters.push(new ethereum.EventParam('from', ethereum.Value.fromAddress(from)))
  transferSharesEvent.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)))
  transferSharesEvent.parameters.push(
    new ethereum.EventParam('sharesValue', ethereum.Value.fromUnsignedBigInt(sharesValue))
  )

  return transferSharesEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))

  return unpausedEvent
}

export function createWithdrawEvent(account: Address, amount: BigInt): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(new ethereum.EventParam('account', ethereum.Value.fromAddress(account)))
  withdrawEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawEvent
}
