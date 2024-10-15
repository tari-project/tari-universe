import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { registeredTappletsActions } from "./registeredTapplets.slice"
import { InitRegisteredTappletsReqPayload } from "./registeredTapplets.types"
import { invoke } from "@tauri-apps/api/core"

export const initializeAction = () => ({
  actionCreator: registeredTappletsActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitRegisteredTappletsReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      await invoke("fetch_tapplets")
      const registeredTapplets = await invoke("read_tapp_registry_db")
      const assetsServerAddr = await invoke("get_assets_server_addr")
      const tappletsWithAssets = registeredTapplets.map((tapp) => ({
        ...tapp,
        logoAddr: `${assetsServerAddr}/${tapp.package_name}/logo.svg`,
        backgroundAddr: `${assetsServerAddr}/${tapp.package_name}/background.svg`,
      }))
      listenerApi.dispatch(registeredTappletsActions.initializeSuccess({ registeredTapplets: tappletsWithAssets }))
    } catch (error) {
      listenerApi.dispatch(registeredTappletsActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
