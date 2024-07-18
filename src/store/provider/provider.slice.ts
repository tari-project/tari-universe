import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./actions/provider.action"
import { ProviderStoreInitialState } from "./provider.constants"
import { InitProviderFailurePayload, InitProviderRequestPayload, InitProviderSuccessPayload } from "./provider.types"

const providerSlice = createSlice({
  name: "provider",
  initialState: ProviderStoreInitialState,
  reducers: {
    initializeRequest: (state, _action: PayloadAction<InitProviderRequestPayload>) => {
      return state
    },

    initializeSuccess: (state, action: PayloadAction<InitProviderSuccessPayload>) => {
      state.provider = action.payload.provider
      state.isInitialized = true

      return state
    },

    initializeFailure: (state, _action: PayloadAction<InitProviderFailurePayload>) => {
      return state
    },
  },
})

export const providerActions = providerSlice.actions
export const providerReducer = providerSlice.reducer

listenerMiddleware.startListening(initializeAction())
