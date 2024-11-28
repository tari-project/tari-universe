import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { devTappletsActions } from "./devTapplets.slice"
import { AddDevTappletReqPayload, DeleteDevTappletReqPayload, InitDevTappletsReqPayload } from "./devTapplets.types"
import { invoke } from "@tauri-apps/api/core"
import { tappletProvidersActions } from "../tappletProviders/tappletProviders.slice"

export const initializeAction = () => ({
  actionCreator: devTappletsActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitDevTappletsReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const devTapplets = await invoke("read_dev_tapplets")
      listenerApi.dispatch(devTappletsActions.initializeSuccess({ devTapplets }))
    } catch (error) {
      listenerApi.dispatch(devTappletsActions.initializeFailure({ errorMsg: error as string }))
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
      await invoke("delete_dev_tapplet", { devTappletId: item.id })

      listenerApi.dispatch(devTappletsActions.deleteDevTappletSuccess({}))
      listenerApi.dispatch(devTappletsActions.initializeRequest({}))
      listenerApi.dispatch(tappletProvidersActions.deleteTappProviderRequest({ tappletId: Number(item.id) }))
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
    const endpoint = action.payload.endpoint
    try {
      await invoke("add_dev_tapplet", { endpoint })

      listenerApi.dispatch(devTappletsActions.addDevTappletSuccess({}))
      listenerApi.dispatch(devTappletsActions.initializeRequest({}))
    } catch (error) {
      listenerApi.dispatch(devTappletsActions.addDevTappletFailure({ errorMsg: error as string }))
    }
  },
})
