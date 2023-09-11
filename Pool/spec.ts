import { Spec, LiveObject, Property, Event, OnEvent, BigInt, Address, Timestamp, BeforeAll, saveAll } from '@spec.dev/core'
import { generatePoolRoleIds } from '../shared/roles.ts'
import Role from '../Role/spec.ts'

/**
 * All Pools created on Allo
 */
@Spec({ 
    uniqueBy: ['poolId', 'chainId'] 
})
class Pool extends LiveObject {

    @Property()
    poolId: string

    @Property()
    profileId: Address
    
    @Property()
    strategy: Address

    @Property()
    token: Address

    @Property({ default: 0 })
    amount: BigInt

    @Property({ default: 0 })
    feePaid: BigInt

    @Property({ default: 0 })
    baseFeePaid: BigInt

    @Property()
    metadata: string[]

    @Property()
    managerRoleId: string

    @Property()
    adminRoleId: string

    @Property()
    createdAt: Timestamp

    // ==== Event Handlers ===================

    @BeforeAll()
    setCommonProperties(event: Event) {
        this.poolId = event.data.poolId.toString()
    }

    @OnEvent('allov2.Allo.PoolCreated')
    async onPoolCreated(event: Event) {
        // Set pool data.
        this.profileId = event.data.profileId
        this.strategy = event.data.strategy
        this.token = event.data.token
        this.amount = BigInt.from(event.data.amount)
        this.metadata = event.data.metadata
        const [managerRoleId, adminRoleId] = generatePoolRoleIds(this.poolId)
        this.managerRoleId = managerRoleId
        this.adminRoleId = adminRoleId
        this.createdAt = this.blockTimestamp

        // Create manager and admin roles for the pool.
        const managerRole = this.new(Role, { roleId: this.managerRoleId })
        const adminRole = this.new(Role, { roleId: this.adminRoleId })

        // Save all in a single tx.
        await saveAll(this, managerRole, adminRole)
    }

    @OnEvent('allov2.Allo.PoolMetadataUpdated')
    onPoolMetadataUpdated(event: Event) {
        this.metadata = event.data.metadata
    }

    @OnEvent('allov2.Allo.PoolFunded')
    async onPoolFunded(event: Event) {
        await this.load()
        this.amount = this.amount.plus(event.data.amount)
        this.feePaid = this.feePaid.plus(event.data.fee)
    }

    @OnEvent('allov2.Allo.BaseFeePaid')
    async onBaseFeePaid(event: Event) {
        await this.load()
        this.baseFeePaid = this.baseFeePaid.plus(event.data.amount)
    }
}

export default Pool