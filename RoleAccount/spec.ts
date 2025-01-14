import { Spec, LiveObject, Property, Event, OnEvent, Address, BeforeAll } from '@spec.dev/core'

/**
 * The accounts associated with an Allo role.
 */
@Spec({ 
    uniqueBy: ['roleId', 'accountId', 'chainId'] 
})
class RoleAccount extends LiveObject {

    @Property()
    roleId: string

    @Property()
    accountId: Address

    @Property()
    isActive: boolean

    // ==== Event Handlers ===================

    @BeforeAll()
    setCommonProperties(event: Event) {
        this.roleId = event.data.role
        this.accountId = event.data.account
    }
    
    @OnEvent('allov2.Allo.RoleGranted')
    @OnEvent('allov2.Registry.RoleGranted')
    grant() {
        this.isActive = true
    }

    @OnEvent('allov2.Allo.RoleRevoked')
    @OnEvent('allov2.Registry.RoleRevoked')
    revoke() {
        this.isActive = false
    }
}

export default RoleAccount