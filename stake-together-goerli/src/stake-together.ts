import { store } from '@graphprotocol/graph-ts'
import { CommunityAdded, CommunityRemoved } from '../generated/StakeTogether/StakeTogether'
import { Community } from '../generated/schema'

export function handleCommunityAdded(event: CommunityAdded): void {
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community == null) {
    community = new Community(id)
  }
  community.account = event.params.account
  community.save()
}

export function handleCommunityRemoved(event: CommunityRemoved): void {
  let id = event.params.account.toHexString()

  let community = Community.load(id)
  if (community != null) {
    store.remove('Community', id)
  }
}
