import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./account.action"
import {
  InitAccountFailurePayload,
  InitAccountRequestPayload,
  InitAccountSuccessPayload,
  AccountStoreState,
  ChangeCurrentAccountPayload,
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
    changeCurrentAccount: (state, action: PayloadAction<ChangeCurrentAccountPayload>) => {
      state.account = action.payload.account
      state.isInitialized = true
    },
  },
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer

listenerMiddleware.startListening(initializeAction())
