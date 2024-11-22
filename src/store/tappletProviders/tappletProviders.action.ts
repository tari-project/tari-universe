import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { invoke } from "@tauri-apps/api/core"

import { tappletProvidersActions } from "./tappletProviders.slice"
import { InitTappletProvidersRequestPayload, TappletProvider } from "./tappletProviders.types"
import { TariPermissions, WalletDaemonParameters } from "@tari-project/tarijs"
import { TUInternalProvider } from "@provider/TUInternalProvider"
import { RootState } from "../store"

export const initializeAction = () => ({
  actionCreator: tappletProvidersActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitTappletProvidersRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      // const tappletProviders: TappletProvider[] = await invoke("launch_tapplet") //TODO implement backend method
      let permissions = new TariPermissions()

      let optionalPermissions = new TariPermissions()
      const params: WalletDaemonParameters = {
        permissions,
        optionalPermissions,
      }
      const tapp = TUInternalProvider.build(params) as any as TappletProvider //TODO types
      listenerApi.dispatch(tappletProvidersActions.addTappProviderReq({ tappletProvider: tapp }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
