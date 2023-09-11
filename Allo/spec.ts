import { Spec, LiveObject, Property, Event, OnEvent, Address, BigInt, saveAll } from '@spec.dev/core'
import Role from '../Role/spec.ts'
import Account from '../Account/spec.ts'
import RoleAccount from '../RoleAccount/spec.ts'

/**
 * Global data
 */
@Spec({ 
    uniqueBy: ['chainId'] 
})
class Allo extends LiveObject {
    
    @Property()
    registry: Address

    @Property()
    feePercentage: BigInt

    @Property()
    baseFee: BigInt

    @Property()
    treasury: Address

    @Property()
    cloneableStrategies: Address[]

    // ==== Event Handlers ===================
 
    @OnEvent('allov2.Allo.RegistryUpdated')
    onSomeEvent(event: Event) {
        this.registry = event.data.registry
    }

    @OnEvent('allov2.Allo.FeePercentageUpdated')
    onFeePercentageUpdated(event: Event) {
        this.feePercentage = BigInt.from(event.data.feePercentage)
    }

    @OnEvent('allov2.Allo.BaseFeeUpdated')
    onBaseFeeUpdated(event: Event) {
        this.baseFee = BigInt.from(event.data.baseFee)
    }

    @OnEvent('allov2.Allo.TreasuryUpdated')
    onTreasuryUpdated(event: Event) {
        this.treasury = event.data.treasury
    }

    @OnEvent('allov2.Allo.StrategyApproved')
    async onStrategyApproved(event: Event) {
        await this.load()
        this.cloneableStrategies.push(event.data.strategy)
    }

    @OnEvent('allov2.Allo.StrategyRemoved')
    async onStrategyRemoved(event: Event) {
        await this.load()
        this.cloneableStrategies = this.cloneableStrategies.filter(strategy => (
            strategy !== event.data.strategy
        ))
    }

    @OnEvent('allov2.Allo.RoleGranted', { autoSave: false })
    async onRoleGranted(event: Event) {
        await this._upsertRoleAccount(event, true)
    }

    @OnEvent('allov2.Allo.RoleRevoked', { autoSave: false })
    async onRoleRevoked(event: Event) {
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
}

export default Allo