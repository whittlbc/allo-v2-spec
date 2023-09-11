import { Spec, LiveObject, Property } from '@spec.dev/core'

/**
 * A role on Allo.
 */
@Spec({
    uniqueBy: ['roleId', 'chainId'] 
})
class Role extends LiveObject {

    @Property()
    roleId: string
}

export default Role