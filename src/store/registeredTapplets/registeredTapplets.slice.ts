import { PayloadAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { RegisteredTapplet } from "@type/tapplet"
import { listenerMiddleware } from "../store.listener"
import { initializeAction } from "./registeredTapplets.action"
import {
  InitRegisteredTappletsReqPayload,
  InitRegisteredTappletsSuccessPayload,
  InitRegisteredTappletsFailurePayload,
} from "./registeredTapplets.types"

export const registeredTappletAdapter = createEntityAdapter<RegisteredTapplet>()

const registeredTappletsSlice = createSlice({
  name: "registeredTapplets",
  initialState: {
    isInitialized: false,
    isFetching: false,
    registeredTapplets: registeredTappletAdapter.getInitialState(),
  },
  reducers: {
    initializeRequest: (state, _action: PayloadAction<InitRegisteredTappletsReqPayload>) => {
      state.isFetching = true
    },

    initializeSuccess: (state, action: PayloadAction<InitRegisteredTappletsSuccessPayload>) => {
      registeredTappletAdapter.upsertMany(state.registeredTapplets, action.payload.registeredTapplets)
      state.isInitialized = true
      state.isFetching = false
    },

    initializeFailure: (state, _action: PayloadAction<InitRegisteredTappletsFailurePayload>) => {
      state.isInitialized = false
      state.isFetching = false
    },
  },
})

export const registeredTappletsActions = registeredTappletsSlice.actions
export const registeredTappletsReducer = registeredTappletsSlice.reducer

listenerMiddleware.startListening(initializeAction())
