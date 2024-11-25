import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { invoke } from "@tauri-apps/api/core"

import { tappletProvidersActions } from "./tappletProviders.slice"
import {
  AddTappletProviderRequestPayload,
  InitTappletProvidersRequestPayload,
  TappletProvider,
} from "./tappletProviders.types"
import { TariPermissions, WalletDaemonParameters } from "@tari-project/tarijs"
import { TUInternalProvider } from "@provider/TUInternalProvider"
import { RootState } from "../store"
import { LaunchedTappResult } from "@type/tapplet"
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
      // const launchedTappParams: LaunchedTappResult = await invoke("launch_tapplet", { tappletId })
      console.log(" ^^^^ ADD PROVIDER LAUNCHED", launchedTappParams)

      let permissions = new TariPermissions()
      if (launchedTappParams.permissions) {
        launchedTappParams.permissions.map((p) => permissions.addPermission(toPermission(p)))
      }
      let optionalPermissions = new TariPermissions() //TODO add support for optional params
      const params: WalletDaemonParameters = {
        permissions,
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
