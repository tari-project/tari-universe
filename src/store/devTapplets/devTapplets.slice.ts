import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DevTapplet } from "@type/tapplet"
import {
  AddDevTappletFailurePayload,
  AddDevTappletReqPayload,
  AddDevTappletSuccessPayload,
  DeleteDevTappletFailurePayload,
  DeleteDevTappletReqPayload,
  DeleteDevTappletSuccessPayload,
  InitDevTappletsFailurePayload,
  InitDevTappletsReqPayload,
  InitDevTappletsSuccessPayload,
} from "./devTapplets.types"
import { listenerMiddleware } from "../store.listener"
import { addDevTappletAction, deleteDevTappletAction, initializeAction } from "./devTapplets.action"

export const devTappletAdapter = createEntityAdapter<DevTapplet>()

const devTappletsSlice = createSlice({
  name: "devTapplets",
  initialState: {
    isInitialized: false,
    isFetching: false,
    devTapplets: devTappletAdapter.getInitialState(),
  },
  reducers: {
    initializeRequest: (state, _: PayloadAction<InitDevTappletsReqPayload>) => {
      state.isFetching = true
    },
    initializeSuccess: (state, action: PayloadAction<InitDevTappletsSuccessPayload>) => {
      devTappletAdapter.upsertMany(state.devTapplets, action.payload.devTapplets)
      state.isInitialized = true
      state.isFetching = false
    },
    initializeFailure: (state, _: PayloadAction<InitDevTappletsFailurePayload>) => {
      state.isInitialized = false
      state.isFetching = false
    },
    deleteDevTappletRequest: (state, _: PayloadAction<DeleteDevTappletReqPayload>) => {
      state.isFetching = true
    },
    deleteDevTappletSuccess: (state, _: PayloadAction<DeleteDevTappletSuccessPayload>) => {
      state.isFetching = false
    },
    deleteDevTappletFailure: (state, _: PayloadAction<DeleteDevTappletFailurePayload>) => {
      state.isFetching = false
    },
    addDevTappletRequest: (state, _: PayloadAction<AddDevTappletReqPayload>) => {
      state.isFetching = true
    },
    addDevTappletSuccess: (state, _: PayloadAction<AddDevTappletSuccessPayload>) => {
      state.isFetching = false
    },
    addDevTappletFailure: (state, _: PayloadAction<AddDevTappletFailurePayload>) => {
      state.isFetching = false
    },
  },
})

export const devTappletsActions = devTappletsSlice.actions
export const devTappletsReducer = devTappletsSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(deleteDevTappletAction())
listenerMiddleware.startListening(addDevTappletAction())
