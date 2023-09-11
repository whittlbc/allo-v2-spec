import { Spec, LiveObject, Property, Event, OnEvent, Address, BigInt, Timestamp, BeforeAll, saveAll, resolveMetadata } from '@spec.dev/core'
import Role from '../Role/spec.ts'
import Account from '../Account/spec.ts'
import RoleAccount from '../RoleAccount/spec.ts'

/**
 * All Profiles created on Registry
 */
@Spec({ 
    uniqueBy: ['profileId', 'chainId'] 
})
class Profile extends LiveObject {
    
    @Property()
    profileId: Address

    @Property()
    nonce: BigInt

    @Property()
    name: string

    @Property()
    metadata: string[]

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

    @OnEvent('allov2.Registry.ProfileCreated', { autoSave: false })
    async onProfileCreated(event: Event) {
        // Set profile data.
        this.nonce = BigInt.from(event.data.nonce)
        this.name = event.data.name
        this.metadata = event.data.metadata
        await this._resolveFullMetadata()
        this.owner = event.data.owner
        this.anchor = event.data.anchor
        this.createdAt = this.blockTimestamp

        // Create account for profile owner.
        const account = this.new(Account, { accountId: this.owner })

        // Create role to house profile members.
        const role = this.new(Role, { roleId: this.profileId })

        // Save all in a single tx.
        await saveAll(this, account, role)
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

    @OnEvent('allov2.Registry.RoleGranted', { autoSave: false })
    async onRoleGranted(event: Event,) {
        await this._upsertRoleAccount(event, true)
    }

    @OnEvent('allov2.Registry.RoleRevoked', { autoSave: false })
    async onRoleRevoked(event: Event,) {
        await this._upsertRoleAccount(event, false)
    }

    // ==== Helpers ===================

    async _upsertRoleAccount(event: Event, isActive: boolean) {
        const role = this.new(Role, { roleId: event.data.role })
        const account = this.new(Account, { accountId: event.data.account })
        const roleAccount = this.new(RoleAccount, { 
            roleId: role.roleId, 
            accountId: account.accountId,
            isActive,
        })
        await saveAll(role, account, roleAccount)
    }

    async _resolveFullMetadata() {
        const [protocolId, pointer] = this.metadata
        const fullMetadata = await resolveMetadata(pointer, { protocolId })
        // TODO: do something with the full metadata.        
    }
}

export default Profile