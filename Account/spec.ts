import { Spec, LiveObject, Property, Address } from '@spec.dev/core'

/**
 * All accounts on Allo V2.
 */
@Spec({ 
    uniqueBy: ['accountId', 'chainId'] 
})
class Account extends LiveObject {

    @Property()
    accountId: Address
}

export default Account