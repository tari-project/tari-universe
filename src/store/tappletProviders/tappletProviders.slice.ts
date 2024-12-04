import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { addTappProviderAction, deleteTappletProviderAction, initializeAction } from "./tappletProviders.action"
import {
  AddTappletProviderFailurePayload,
  AddTappletProviderRequestPayload,
  AddTappletProviderSuccessPayload,
  DeleteTappletProviderFailurePayload,
  DeleteTappletProviderRequestPayload,
  DeleteTappletProviderSuccessPayload,
  InitTappletProvidersFailurePayload,
  InitTappletProvidersRequestPayload,
  InitTappletProvidersSuccessPayload,
  UpdateTappletProviderFailurePayload,
  UpdateTappletProviderRequestPayload,
  UpdateTappletProviderSuccessPayload,
} from "./tappletProviders.types"
import { TappletProvider } from "@provider/TappletProvider"

export const tappletProvidersAdapter = createEntityAdapter<TappletProvider>()

const tappletProvidersSlice = createSlice({
  name: "tappletProviders",
  initialState: tappletProvidersAdapter.getInitialState(),
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitTappletProvidersRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitTappletProvidersSuccessPayload>) => {
      tappletProvidersAdapter.setAll(state, action.payload.tappletProviders)
    },
    initializeFailure: (_, _action: PayloadAction<InitTappletProvidersFailurePayload>) => {},
    addTappProviderReq: (_, _action: PayloadAction<AddTappletProviderRequestPayload>) => {},
    addTappProviderSuccess: (state, action: PayloadAction<AddTappletProviderSuccessPayload>) => {
      tappletProvidersAdapter.addOne(state, action.payload.tappletProvider)
    },
    addTappProviderFailure: (_, _action: PayloadAction<AddTappletProviderFailurePayload>) => {},
    deleteTappProviderRequest: (_, _action: PayloadAction<DeleteTappletProviderRequestPayload>) => {},
    deleteTappProviderSuccess: (state, action: PayloadAction<DeleteTappletProviderSuccessPayload>) => {
      tappletProvidersAdapter.removeOne(state, action.payload.id)
    },
    deleteTappProviderFailure: (_, _action: PayloadAction<DeleteTappletProviderFailurePayload>) => {},
    updateTappProviderRequest: (_, _action: PayloadAction<UpdateTappletProviderRequestPayload>) => {},
    updateTappProviderSuccess: (state, action: PayloadAction<UpdateTappletProviderSuccessPayload>) => {
      tappletProvidersAdapter.updateOne(state, {
        id: action.payload.tappletProvider.id,
        changes: {
          params: action.payload.tappletProvider.params,
        },
      })
    },
    updateTappProviderFailure: (_, _action: PayloadAction<UpdateTappletProviderFailurePayload>) => {},
  },
})

export const tappletProvidersActions = tappletProvidersSlice.actions
export const tappletProvidersReducer = tappletProvidersSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(addTappProviderAction())
listenerMiddleware.startListening(deleteTappletProviderAction())
