import { Spec, LiveObject, Property, Address } from '@spec.dev/core'

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
}

export default RoleAccount