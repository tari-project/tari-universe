import { permissions as walletPermissions, TariPermissions } from "@tari-project/tarijs"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/TariUniverseProvider"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

const providerStateSelector = (state: RootState) => state.provider

const isInitialized = createSelector([providerStateSelector], (state) => state.isInitialized)

const selectProvider = createSelector([providerStateSelector], (_) => {
  let permissions = new TariPermissions()
  permissions.addPermission(new TariPermissionKeyList())
  permissions.addPermission(new TariPermissionAccountInfo())
  permissions.addPermission(new TariPermissionTransactionSend())
  permissions.addPermission(new TariPermissionSubstatesRead())
  let optionalPermissions = new TariPermissions()
  const params: WalletDaemonParameters = {
    permissions,
    optionalPermissions,
  }
  return WalletDaemonTariProvider.build(params)
})

export const providerSelector = {
  isInitialized,
  selectProvider,
}
