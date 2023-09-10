import { Spec, LiveTable, Property, Event, OnEvent, Address, Json, BigInt, Timestamp, BeforeAll, resolveMetadata } from '@spec.dev/core'

/**
 * All Profiles created on Registry
 */
@Spec({ 
    uniqueBy: ['profileId', 'chainId'] 
})
class Profile extends LiveTable {
    
    @Property()
    profileId: Address

    @Property()
    nonce: BigInt

    @Property()
    name: string

    @Property()
    metadata: Json

    @Property()
    owner: Address  

    @Property()
    anchor: Address

    @Property()
    createdAt: Timestamp

    // ==== Event Handlers ===================

    @BeforeAll()
    setCommonProperties(event: Event) {
        this.profileId = event.data.profileId
    }

    @OnEvent('allov2.Registry.ProfileCreated')
    async onProfileCreated(event: Event) {
        this.nonce = BigInt.from(event.data.nonce)
        this.name = event.data.name
        this.metadata = event.data.metadata
        await this._resolveFullMetadata()
        this.owner = event.data.owner
        this.anchor = event.data.anchor
        this.createdAt = this.blockTimestamp
    }

    @OnEvent('allov2.Registry.ProfileNameUpdated')
    onProfileNameUpdated(event: Event) {
        this.name = event.data.name
        this.anchor = event.data.anchor
    }

    @OnEvent('allov2.Registry.ProfileMetadataUpdated')
    async onProfileMetadataUpdated(event: Event) { 
        this.metadata = event.data.metadata
        await this._resolveFullMetadata()
    }

    @OnEvent('allov2.Registry.ProfileOwnerUpdated')
    onProfileOwnerUpdated(event: Event) {
        this.owner = event.data.owner
    }

    // ==== Helpers ===================

    async _resolveFullMetadata() {
        const [protocolId, pointer] = this.metadata as string[]
        const fullMetadata = await resolveMetadata(pointer, { protocolId })
        // TODO: do something with the full metadata.        
    }
}

export default Profile