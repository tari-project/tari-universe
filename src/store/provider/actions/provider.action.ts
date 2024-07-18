import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { permissions as walletPermissions, TariPermissions } from "@tariproject/tarijs"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { InitProviderRequestPayload } from "../provider.types"
import { providerActions } from "../provider.slice"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

export const initializeAction = () => ({
  actionCreator: providerActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
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

      const provider = await WalletDaemonTariProvider.build(params)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
