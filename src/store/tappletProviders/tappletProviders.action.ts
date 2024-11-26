import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { tappletProvidersActions } from "./tappletProviders.slice"
import {
  AddTappletProviderRequestPayload,
  InitTappletProvidersRequestPayload,
  TappletProvider,
} from "./tappletProviders.types"
import { TariPermissions, WalletDaemonParameters } from "@tari-project/tarijs"
import { TUInternalProvider } from "@provider/TUInternalProvider"
import { toPermission } from "@type/tariPermissions"

export const initializeAction = () => ({
  actionCreator: tappletProvidersActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitTappletProvidersRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      listenerApi.dispatch(tappletProvidersActions.initializeSuccess({ tappletProviders: [] })) //TODO empty or fetch?
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const addTappProviderAction = () => ({
  actionCreator: tappletProvidersActions.addTappProviderReq,
  effect: async (
    action: PayloadAction<AddTappletProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      console.log(" ^^^^ ADD PROVIDER ACTION")
      const launchedTappParams = action.payload.launchedTappParams
      console.log(" ^^^^ ADD PROVIDER LAUNCHED", launchedTappParams)

      let requiredPermissions = new TariPermissions()
      let optionalPermissions = new TariPermissions() //TODO add support for optional params
      if (launchedTappParams.permissions) {
        launchedTappParams.permissions.requiredPermissions.map((p) =>
          requiredPermissions.addPermission(toPermission(p))
        )
        launchedTappParams.permissions.optionalPermissions.map((p) =>
          optionalPermissions.addPermission(toPermission(p))
        )
      }
      const params: WalletDaemonParameters = {
        permissions: requiredPermissions,
        optionalPermissions,
      }
      const provider: TappletProvider = {
        id: action.payload.installedTappletId,
        permissions: launchedTappParams.permissions,
        provider: TUInternalProvider.build(params),
      }
      console.log(" ^^^^ ADD PROVIDER PROVIDER", provider)
      listenerApi.dispatch(tappletProvidersActions.addTappProviderSuccess({ tappletProvider: provider }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.addTappProviderFailure({ errorMsg: error as string }))
    }
  },
})
