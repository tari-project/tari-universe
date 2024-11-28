import { TariPermissions, WalletDaemonParameters } from "@tari-project/tarijs"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { TUInternalProvider } from "@provider/TUInternalProvider"
import { toPermission } from "@type/tariPermissions"

const providerStateSelector = (state: RootState) => state.provider

const isInitialized = createSelector([providerStateSelector], (state) => state.isInitialized)

const selectProvider = createSelector([providerStateSelector], (state) => {
  let permissions = new TariPermissions()
  let optionalPermissions = new TariPermissions()
  if (state.permissions) {
    state.permissions.requiredPermissions.map((p) => permissions.addPermission(toPermission(p)))
    state.permissions.optionalPermissions.map((p) => optionalPermissions.addPermission(toPermission(p)))
  }

  const params: WalletDaemonParameters = {
    permissions,
    optionalPermissions,
  }
  return TUInternalProvider.build(params)
})

export const providerSelector = {
  isInitialized,
  selectProvider,
}
