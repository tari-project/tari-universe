import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction, updatePermissionsAction } from "./provider.action"
import {
  InitProviderFailurePayload,
  InitProviderRequestPayload,
  InitProviderSuccessPayload,
  ProviderStoreState,
  UpdatePermissionsFailurePayload,
  UpdatePermissionsRequestPayload,
  UpdatePermissionsSuccessPayload,
} from "./provider.types"
import {
  TariPermissionAccountInfo,
  TariPermissionAccountList,
  TariPermissionKeyList,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
} from "@tari-project/tarijs/dist/providers/tari_universe"

const initialState: ProviderStoreState = {
  isInitialized: false,
  provider: null,
  // TODO default permissions for built-in provider
  permissions: {
    requiredPermissions: [
      new TariPermissionAccountInfo(),
      new TariPermissionAccountList(),
      new TariPermissionKeyList(),
      new TariPermissionSubstatesRead(),
      new TariPermissionTransactionSend(),
    ],
    optionalPermissions: [],
  },
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
    updatePermissionsRequest: (_, _action: PayloadAction<UpdatePermissionsRequestPayload>) => {},
    updatePermissionsSuccess: (state, action: PayloadAction<UpdatePermissionsSuccessPayload>) => {
      state.permissions = action.payload.permissions
    },
    updatePermissionsFailure: (_, _action: PayloadAction<UpdatePermissionsFailurePayload>) => {},
  },
})

export const providerActions = providerSlice.actions
export const providerReducer = providerSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(updatePermissionsAction())
