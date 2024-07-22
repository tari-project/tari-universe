import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./actions/registeredTapplets.action"
import { TappletStoreInitialState, registeredTappletAdapter } from "./registeredTapplets.constants"
import {
  InitRegisteredTappletsReqPayload,
  InitRegisteredTappletsSuccessPayload,
  InitRegisteredTappletsFailurePayload,
} from "./registeredTapplets.types"

const registeredTappletsSlice = createSlice({
  name: "registeredTapplets",
  initialState: TappletStoreInitialState,
  reducers: {
    initializeRequest: (state, _action: PayloadAction<InitRegisteredTappletsReqPayload>) => {
      state.isFetching = true
    },

    initializeSuccess: (state, action: PayloadAction<InitRegisteredTappletsFailurePayload>) => {
      registeredTappletAdapter.upsertMany(state.registeredTapplets, action.payload.registeredTapplets)
      state.isInitialized = true
      state.isFetching = false
    },

    initializeFailure: (state, _action: PayloadAction<InitRegisteredTappletsSuccessPayload>) => {
      state.isInitialized = false
      state.isFetching = false
    },
  },
})

export const registeredTappletsActions = registeredTappletsSlice.actions
export const registeredTappletsReducer = registeredTappletsSlice.reducer

listenerMiddleware.startListening(initializeAction())
