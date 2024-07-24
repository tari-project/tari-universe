import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { devTappletsActions } from "./devTapplets.slice"
import { AddDevTappletReqPayload, DeleteDevTappletReqPayload, InitDevTappletsReqPayload } from "./devTapplets.types"
import { RegisteredTapplet } from "@type/tapplet"
import { invoke } from "@tauri-apps/api/core"
import { registeredTappletsActions } from "../registeredTapplets/registeredTapplets.slice"

export const initializeAction = () => ({
  actionCreator: devTappletsActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitDevTappletsReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      await invoke("fetch_tapplets")
      const registeredTapplets = (await invoke("read_tapp_registry_db")) as RegisteredTapplet[]
      listenerApi.dispatch(registeredTappletsActions.initializeSuccess({ registeredTapplets }))
    } catch (error) {
      listenerApi.dispatch(registeredTappletsActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const deleteDevTappletAction = () => ({
  actionCreator: devTappletsActions.deleteDevTappletRequest,
  effect: async (
    action: PayloadAction<DeleteDevTappletReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const item = action.payload.item
    try {
      await invoke("delete_dev_tapp", { tappletId: item.id })
      await invoke("delete_dev_tapp_db", { tappletId: item.id })

      listenerApi.dispatch(devTappletsActions.deleteDevTappletSuccess({}))
      listenerApi.dispatch(devTappletsActions.initializeRequest({}))
    } catch (error) {
      listenerApi.dispatch(devTappletsActions.deleteDevTappletFailure({ errorMsg: error as string }))
    }
  },
})

export const addDevTappletAction = () => ({
  actionCreator: devTappletsActions.addDevTappletRequest,
  effect: async (
    action: PayloadAction<AddDevTappletReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const tappletId = action.payload.tappletId
    try {
      await invoke("download_and_extract_tapp", { tappletId })
      const isCheckumValid = await invoke("calculate_and_validate_tapp_checksum", {
        tappletId: tappletId,
      })
      console.log("Checksum validation result: ", isCheckumValid) // unused variable causes build failure
      await invoke("insert_dev_tapp_db", { tappletId })
      listenerApi.dispatch(devTappletsActions.addDevTappletSuccess({}))
      listenerApi.dispatch(devTappletsActions.initializeRequest({}))
    } catch (error) {
      listenerApi.dispatch(devTappletsActions.addDevTappletFailure({ errorMsg: error as string }))
    }
  },
})
