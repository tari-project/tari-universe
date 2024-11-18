import { TariPermissions } from "@tari-project/tarijs"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { WalletDaemonParameters, TariUniverseProvider } from "@provider/TariUniverseProvider"
import { toPermission } from "@type/tariPermissions"

const providerStateSelector = (state: RootState) => state.provider

const isInitialized = createSelector([providerStateSelector], (state) => state.isInitialized)

const selectProvider = createSelector([providerStateSelector], (state) => {
  let permissions = new TariPermissions()
  if (state.permissions) {
    state.permissions.map((p) => permissions.addPermission(toPermission(p)))
  }

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
