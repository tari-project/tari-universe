import { TariPermissions } from "@tari-project/tarijs"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { WalletDaemonParameters, TUInternalProvider } from "@provider/TUInternalProvider"

const tappletProvidersStateSelector = (state: RootState) => state.tappletProviders

const selectTappletProvider = createSelector([tappletProvidersStateSelector], (state) => {
  let permissions = new TariPermissions()
  // TODO add
  // if (state.tappletProviders.) {
  //   state.permissions.map((p) => permissions.addPermission(toPermission(p)))
  // }

  let optionalPermissions = new TariPermissions()
  const params: WalletDaemonParameters = {
    permissions,
    optionalPermissions,
  }
  return TUInternalProvider.build(params)
})

export const tappletProviderSelector = {
  selectTappletProvider,
}
