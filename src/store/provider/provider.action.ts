import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { InitProviderRequestPayload, UpdatePermissionsRequestPayload } from "./provider.types"
import { providerActions } from "./provider.slice"
import { TUInternalProvider } from "@provider/TUInternalProvider"
import { WalletDaemonParameters } from "@tari-project/tarijs"
import {
  TariPermissionAccountInfo,
  TariPermissionAccountList,
  TariPermissionKeyList,
  TariPermissions,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
} from "@tari-project/tarijs/dist/providers/tari_universe"

export const initializeAction = () => ({
  actionCreator: providerActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      console.log("[store provider] INIT")
      //TODO set default permissions - at the moment 'Admin' is ok
      let permissions = new TariPermissions()
      let optionalPermissions = new TariPermissions()
      permissions.addPermission("Admin")

      const params: WalletDaemonParameters = {
        permissions,
        optionalPermissions,
      }
      const internalProvider = TUInternalProvider.build(params)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider: internalProvider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const updatePermissionsAction = () => ({
  actionCreator: providerActions.updatePermissionsRequest,
  effect: async (
    action: PayloadAction<UpdatePermissionsRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const permissions = action.payload.permissions
    try {
      listenerApi.dispatch(providerActions.updatePermissionsSuccess({ permissions: permissions }))
    } catch (error) {
      listenerApi.dispatch(providerActions.updatePermissionsFailure({ errorMsg: error as string }))
    }
  },
})
