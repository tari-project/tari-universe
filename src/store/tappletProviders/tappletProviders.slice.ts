import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./tappletProviders.action"
import {
  AddTappletProvidersRequestPayload,
  InitTappletProvidersFailurePayload,
  InitTappletProvidersRequestPayload,
  InitTappletProvidersSuccessPayload,
  TappletProvider,
  TappletProvidersStoreState,
} from "./tappletProviders.types"

export const tappletProvidersAdapter = createEntityAdapter<TappletProvider>()

const initialState: TappletProvidersStoreState = {
  isInitialized: false,
  tappletProviders: tappletProvidersAdapter.getInitialState(),
}

const tappletProvidersSlice = createSlice({
  name: "tappletProviders",
  initialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitTappletProvidersRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitTappletProvidersSuccessPayload>) => {
      state.isInitialized = true
      tappletProvidersAdapter.setAll(state.tappletProviders, action.payload.tappletProviders)
    },
    initializeFailure: (_, _action: PayloadAction<InitTappletProvidersFailurePayload>) => {},
    addTappProviderReq: (state, action: PayloadAction<AddTappletProvidersRequestPayload>) => {
      // tappletProvidersAdapter.addOne(state, action.payload.tappletProvider) //TODO
    },
  },
})

export const tappletProvidersActions = tappletProvidersSlice.actions
export const tappletProvidersReducer = tappletProvidersSlice.reducer

listenerMiddleware.startListening(initializeAction())
