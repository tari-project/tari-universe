import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction, setAccountAction } from "./account.action"
import {
  InitAccountFailurePayload,
  InitAccountRequestPayload,
  InitAccountSuccessPayload,
  AccountStoreState,
  SetAccountRequestPayload,
  SetAccountSuccessPayload,
  SetAccountFailurePayload,
} from "./account.types"

const initialState: AccountStoreState = {
  isInitialized: false,
  account: null,
}

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitAccountRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitAccountSuccessPayload>) => {
      state.account = action.payload.account
      state.isInitialized = true
    },
    initializeFailure: (_, _action: PayloadAction<InitAccountFailurePayload>) => {},
    setAccountRequest: (_, _action: PayloadAction<SetAccountRequestPayload>) => {},
    setAccountSuccess: (state, action: PayloadAction<SetAccountSuccessPayload>) => {
      state.account = action.payload.account
      state.isInitialized = true
    },
    setAccountFailure: (_, _action: PayloadAction<SetAccountFailurePayload>) => {},
  },
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(setAccountAction())
