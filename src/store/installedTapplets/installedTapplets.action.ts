import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { installedTappletsActions } from "./installedTapplets.slice"
import {
  AddInstalledTappletReqPayload,
  DeleteInstalledTappletReqPayload,
  InitInstalledTappletsReqPayload,
} from "./installedTapplets.types"
import { InstalledTappletWithName } from "@type/tapplet"
import { invoke } from "@tauri-apps/api/core"

export const initializeAction = () => ({
  actionCreator: installedTappletsActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitInstalledTappletsReqPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const installedTapplets: InstalledTappletWithName[] = await invoke("read_installed_tapp_db")
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
    const item = action.payload.item
    try {
      await invoke("delete_installed_tapp", { tappletId: item.installed_tapplet.tapplet_id })
      await invoke("delete_installed_tapp_db", { tappletId: item.installed_tapplet.tapplet_id })

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
