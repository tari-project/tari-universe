import { permissions as walletPermissions, TariPermissions } from "@tari-project/tarijs"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { WalletDaemonParameters, TariUniverseProvider } from "@provider/TariUniverseProvider"

const {
  TariPermissionAccountInfo,
  TariPermissionKeyList,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
  TariPermissionAccountList,
  TariPermissionTemplatesRead,
  TariPermissionTransactionGet,
  TariPermissionTransactionsGet,
} = walletPermissions

const providerStateSelector = (state: RootState) => state.provider

const isInitialized = createSelector([providerStateSelector], (state) => state.isInitialized)

const selectProvider = createSelector([providerStateSelector], (_) => {
  // TODO read permissions from tapplet manifest
  let permissions = new TariPermissions()
  permissions.addPermission(new TariPermissionKeyList())
  permissions.addPermission(new TariPermissionAccountInfo())
  permissions.addPermission(new TariPermissionAccountList())
  permissions.addPermission(new TariPermissionTemplatesRead())
  permissions.addPermission(new TariPermissionTransactionGet())
  permissions.addPermission(new TariPermissionTransactionsGet())
  permissions.addPermission(new TariPermissionTransactionSend())
  permissions.addPermission(new TariPermissionSubstatesRead())
  let optionalPermissions = new TariPermissions()
  const params: WalletDaemonParameters = {
    permissions,
    optionalPermissions,
  }
  return TariUniverseProvider.build(params)
})

export const providerSelector = {
  isInitialized,
  selectProvider,
}
