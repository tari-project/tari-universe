import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { addTappProviderAction, initializeAction } from "./tappletProviders.action"
import {
  AddTappletProviderFailurePayload,
  AddTappletProviderRequestPayload,
  AddTappletProviderSuccessPayload,
  InitTappletProvidersFailurePayload,
  InitTappletProvidersRequestPayload,
  InitTappletProvidersSuccessPayload,
  TappletProvider,
} from "./tappletProviders.types"

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
      tappletProvidersAdapter.addOne(state, action.payload.tappletProvider) //TODO
    },
    addTappProviderFailure: (_, _action: PayloadAction<AddTappletProviderFailurePayload>) => {},
  },
})

export const tappletProvidersActions = tappletProvidersSlice.actions
export const tappletProvidersReducer = tappletProvidersSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(addTappProviderAction())
