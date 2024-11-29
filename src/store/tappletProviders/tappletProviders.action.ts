import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { tappletProvidersActions } from "./tappletProviders.slice"
import {
  AddTappletProviderRequestPayload,
  DeleteTappletProviderRequestPayload,
  InitTappletProvidersRequestPayload,
  UpdateTappletProviderRequestPayload,
} from "./tappletProviders.types"
import { TariPermissions } from "@tari-project/tarijs"
import { toPermission } from "@type/tariPermissions"
import { TappletProvider, TappletProviderParams } from "@provider/TappletProvider"

export const initializeAction = () => ({
  actionCreator: tappletProvidersActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitTappletProvidersRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      listenerApi.dispatch(tappletProvidersActions.initializeSuccess({ tappletProviders: [] }))
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
      console.log("[store tapp provider]  ADD PROVIDER ACTION")
      const launchedTappParams = action.payload.launchedTappParams
      console.log("[store tapp provider]  ADD PROVIDER LAUNCHED", launchedTappParams)

      let requiredPermissions = new TariPermissions()
      let optionalPermissions = new TariPermissions()
      if (launchedTappParams.permissions) {
        launchedTappParams.permissions.requiredPermissions.map((p) =>
          requiredPermissions.addPermission(toPermission(p))
        )
        launchedTappParams.permissions.optionalPermissions.map((p) =>
          optionalPermissions.addPermission(toPermission(p))
        )
      }
      const params: TappletProviderParams = {
        id: action.payload.id,
        permissions: launchedTappParams.permissions,
      }
      const provider: TappletProvider = TappletProvider.build(params)

      console.log("[store tapp provider] ADD TAPP PROVIDER", provider)
      listenerApi.dispatch(tappletProvidersActions.addTappProviderSuccess({ tappletProvider: provider }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.addTappProviderFailure({ errorMsg: error as string }))
    }
  },
})

export const deleteTappletProviderAction = () => ({
  actionCreator: tappletProvidersActions.deleteTappProviderRequest,
  effect: async (
    action: PayloadAction<DeleteTappletProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const id = action.payload.id
    console.log("[store tapp provider] DELETE tapp ID ", id)
    try {
      listenerApi.dispatch(tappletProvidersActions.deleteTappProviderSuccess({ id }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.deleteTappProviderFailure({ errorMsg: error as string }))
    }
  },
})

export const updateTappletProviderAction = () => ({
  actionCreator: tappletProvidersActions.updateTappProviderRequest,
  effect: async (
    action: PayloadAction<UpdateTappletProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const params: TappletProviderParams = {
      id: action.payload.id,
      permissions: action.payload.permissions,
    }
    const provider: TappletProvider = TappletProvider.build(params)

    try {
      listenerApi.dispatch(tappletProvidersActions.updateTappProviderSuccess({ tappletProvider: provider }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.updateTappProviderFailure({ errorMsg: error as string }))
    }
  },
})
