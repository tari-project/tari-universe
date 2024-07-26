import { createAction, ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { installedTappletsActions } from "./installedTapplets.slice"
import {
  AddInstalledTappletReqPayload,
  DeleteInstalledTappletReqPayload,
  InitInstalledTappletsReqPayload,
  UpdateInstalledTappletReqPayload,
} from "./installedTapplets.types"
import { invoke } from "@tauri-apps/api/core"
import { RootState } from "../store"

export const initializeAction = () => ({
  actionCreator: installedTappletsActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitInstalledTappletsReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const installedTapplets = await invoke("read_installed_tapp_db")
      listenerApi.dispatch(installedTappletsActions.initializeSuccess({ installedTapplets }))
    } catch (error) {
      listenerApi.dispatch(installedTappletsActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const deleteInstalledTappletAction = () => ({
  actionCreator: installedTappletsActions.deleteInstalledTappletRequest,
  effect: async (
    action: PayloadAction<DeleteInstalledTappletReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const tappletId = action.payload.tappletId
    try {
      await invoke("delete_installed_tapp", { tappletId })
      await invoke("delete_installed_tapp_db", { tappletId })

      listenerApi.dispatch(installedTappletsActions.deleteInstalledTappletSuccess({}))
      listenerApi.dispatch(installedTappletsActions.initializeRequest({}))
    } catch (error) {
      listenerApi.dispatch(installedTappletsActions.deleteInstalledTappletFailure({ errorMsg: error as string }))
    }
  },
})

export const addInstalledTappletAction = () => ({
  actionCreator: installedTappletsActions.addInstalledTappletRequest,
  effect: async (
    action: PayloadAction<AddInstalledTappletReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const tappletId = action.payload.tappletId
    try {
      await invoke("download_and_extract_tapp", { tappletId })
      const isCheckumValid = await invoke("calculate_and_validate_tapp_checksum", {
        tappletId: tappletId,
      })
      console.log("Checksum validation result: ", isCheckumValid) // unused variable causes build failure
      await invoke("insert_installed_tapp_db", { tappletId })
      listenerApi.dispatch(installedTappletsActions.addInstalledTappletSuccess({}))
      listenerApi.dispatch(installedTappletsActions.initializeRequest({}))
    } catch (error) {
      listenerApi.dispatch(installedTappletsActions.addInstalledTappletFailure({ errorMsg: error as string }))
    }
  },
})

export const updateInstalledTappletAction = () => ({
  actionCreator: installedTappletsActions.updateInstalledTappletRequest,
  effect: async (
    action: PayloadAction<UpdateInstalledTappletReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const item = action.payload.item
    try {
      listenerApi.dispatch(
        installedTappletsActions.deleteInstalledTappletRequest({ tappletId: item.installed_tapplet.id })
      )
      const fetchedTapplets = createAction(installedTappletsActions.initializeSuccess.type)
      await listenerApi.condition((action, currentState, previousState) => {
        const { installedTapplets } = currentState as RootState
        const { installedTapplets: previousInstalledTapplets } = previousState as RootState

        const previousInstalledTapplet =
          previousInstalledTapplets.installedTapplets.entities[item.installed_tapplet.tapplet_id]
        const currentInstalledTapplet = installedTapplets.installedTapplets.entities[item.installed_tapplet.tapplet_id]

        if (action.type !== fetchedTapplets.type) {
          return false
        }

        if (previousInstalledTapplet && !currentInstalledTapplet) {
          if (previousInstalledTapplet.installed_version === item.installed_version) {
            return true
          }
        }

        return false
      }, 1000)
      listenerApi.dispatch(
        installedTappletsActions.addInstalledTappletRequest({ tappletId: item.installed_tapplet.tapplet_id })
      )
    } catch (error) {
      listenerApi.dispatch(installedTappletsActions.addInstalledTappletFailure({ errorMsg: error as string }))
    }
  },
})
