import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./provider.action"
import {
  InitProviderFailurePayload,
  InitProviderRequestPayload,
  InitProviderSuccessPayload,
  ProviderStoreState,
  UpdatePermissionsSuccessPayload,
} from "./provider.types"

const initialState: ProviderStoreState = {
  isInitialized: false,
  provider: null,
  permissions: null,
}

const providerSlice = createSlice({
  name: "provider",
  initialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitProviderRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitProviderSuccessPayload>) => {
      state.provider = action.payload.provider
      state.isInitialized = true
    },
    initializeFailure: (_, _action: PayloadAction<InitProviderFailurePayload>) => {},
    updatePermissions: (state, action: PayloadAction<UpdatePermissionsSuccessPayload>) => {
      state.permissions = action.payload.permissions
    },
  },
})

export const providerActions = providerSlice.actions
export const providerReducer = providerSlice.reducer

listenerMiddleware.startListening(initializeAction())
