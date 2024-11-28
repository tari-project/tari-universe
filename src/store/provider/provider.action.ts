import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { InitProviderRequestPayload, UpdatePermissionsRequestPayload } from "./provider.types"
import { providerActions } from "./provider.slice"
import { RootState } from "../store"
import { providerSelector } from "./provider.selector"

export const initializeAction = () => ({
  actionCreator: providerActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const state = listenerApi.getState() as RootState
      const provider = providerSelector.selectProvider(state) //TODO why we need this?
      console.log("[store] INIT PROVIDER", provider.providerName)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const updatePermissionsAction = () => ({
  actionCreator: providerActions.updatePermissionsRequest,
  effect: async (
    action: PayloadAction<UpdatePermissionsRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const permissions = action.payload.permissions
    try {
      listenerApi.dispatch(providerActions.updatePermissionsSuccess({ permissions: permissions }))
    } catch (error) {
      listenerApi.dispatch(providerActions.updatePermissionsFailure({ errorMsg: error as string }))
    }
  },
})
