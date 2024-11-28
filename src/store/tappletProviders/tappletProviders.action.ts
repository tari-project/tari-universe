import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { tappletProvidersActions } from "./tappletProviders.slice"
import {
  AddTappletProviderRequestPayload,
  DeleteTappletProviderRequestPayload,
  InitTappletProvidersRequestPayload,
  TappletProvider,
  UpdateTappletProviderRequestPayload,
} from "./tappletProviders.types"
import { TariPermissions, WalletDaemonParameters } from "@tari-project/tarijs"
import { TUInternalProvider } from "@provider/TUInternalProvider"
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
      console.log(" ^^^^ ADD PROVIDER LAUNCHED", launchedTappParams)

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
      const params: WalletDaemonParameters = {
        permissions: requiredPermissions,
        optionalPermissions,
      }
      const provider: TappletProvider = {
        id: action.payload.installedTappletId,
        provider: TUInternalProvider.build(params),
      }
      console.log(" ^^^^ ADD PROVIDER PROVIDER", provider)
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
    const tappletProviderId = action.payload.tappletId
    console.log("******** DELETE ME ", tappletProviderId)
    try {
      listenerApi.dispatch(tappletProvidersActions.deleteTappProviderSuccess({ tappletProviderId }))
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
    const id = action.payload.tappletId
    let requiredPermissions = new TariPermissions()
    let optionalPermissions = new TariPermissions()
    if (action.payload.permissions) {
      action.payload.permissions.requiredPermissions.map((p) => requiredPermissions.addPermission(toPermission(p)))
      action.payload.permissions.optionalPermissions.map((p) => optionalPermissions.addPermission(toPermission(p)))
    }
    const params: WalletDaemonParameters = {
      permissions: requiredPermissions,
      optionalPermissions,
    }
    const provider: TappletProvider = {
      id,
      provider: TUInternalProvider.build(params),
    }
    try {
      listenerApi.dispatch(tappletProvidersActions.updateTappProviderSuccess({ tappletProvider: provider }))
    } catch (error) {
      listenerApi.dispatch(tappletProvidersActions.updateTappProviderFailure({ errorMsg: error as string }))
    }
  },
})
