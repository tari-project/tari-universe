import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { confirmTransactionAction, initializeAction } from "./actions/provider.action"
import { ProviderStoreInitialState } from "./provider.constants"
import { InitProviderFailurePayload, InitProviderRequestPayload, InitProviderSuccessPayload } from "./provider.types"

const providerSlice = createSlice({
  name: "provider",
  initialState: ProviderStoreInitialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitProviderRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitProviderSuccessPayload>) => {
      state.provider = action.payload.provider
      state.isInitialized = true
    },
    initializeFailure: (_, _action: PayloadAction<InitProviderFailurePayload>) => {},
    submitTransaction: (_) => {},
    rejectTransaction: (_) => {},
  },
})

export const providerActions = providerSlice.actions
export const providerReducer = providerSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(confirmTransactionAction())
