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
      listenerApi.dispatch(registeredTappletsActions.initializeSuccess({ registeredTapplets }))
    } catch (error) {
      listenerApi.dispatch(registeredTappletsActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
