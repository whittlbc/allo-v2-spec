import { Spec, LiveTable, Property, Event, OnEvent, Address } from '@spec.dev/core'

/**
 * All accounts on Allo V2.
 */
@Spec({ 
    uniqueBy: ['accountId', 'chainId'] 
})
class Account extends LiveTable {

    @Property()
    accountId: Address

    // ==== Event Handlers ===================
    
    @OnEvent('allov2.Registry.ProfileCreated')
    createForProfileOwner(event: Event) {
        this.accountId = event.data.owner
    }

    @OnEvent('allov2.Allo.RoleGranted')
    @OnEvent('allov2.Allo.RoleRevoked')
    @OnEvent('allov2.Registry.RoleRevoked')
    @OnEvent('allov2.Registry.RoleGranted')
    createForRole(event: Event) {
        this.accountId = event.data.account
    }    
}

export default Account