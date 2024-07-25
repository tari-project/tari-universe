import { createEntityAdapter, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { InstalledTappletWithName } from "@type/tapplet"
import {
  AddInstalledTappletFailurePayload,
  AddInstalledTappletReqPayload,
  AddInstalledTappletSuccessPayload,
  DeleteInstalledTappletFailurePayload,
  DeleteInstalledTappletReqPayload,
  DeleteInstalledTappletSuccessPayload,
  InitInstalledTappletsFailurePayload,
  InitInstalledTappletsReqPayload,
  InitInstalledTappletsSuccessPayload,
} from "./installedTapplets.types"
import { listenerMiddleware } from "../store.listener"
import { addInstalledTappletAction, deleteInstalledTappletAction, initializeAction } from "./installedTapplets.action"

export const installedTappletAdapter = createEntityAdapter<InstalledTappletWithName, string>({
  selectId: ({ installed_tapplet }) => installed_tapplet.tapplet_id,
})

const installedTappletsSlice = createSlice({
  name: "installedTapplets",
  initialState: {
    isInitialized: false,
    isFetching: false,
    installedTapplets: installedTappletAdapter.getInitialState(),
  },
  reducers: {
    initializeRequest: (state, _: PayloadAction<InitInstalledTappletsReqPayload>) => {
      state.isFetching = true
    },
    initializeSuccess: (state, action: PayloadAction<InitInstalledTappletsSuccessPayload>) => {
      installedTappletAdapter.setAll(state.installedTapplets, action.payload.installedTapplets)
      state.isInitialized = true
      state.isFetching = false
    },
    initializeFailure: (state, _: PayloadAction<InitInstalledTappletsFailurePayload>) => {
      state.isInitialized = false
      state.isFetching = false
    },
    deleteInstalledTappletRequest: (state, _: PayloadAction<DeleteInstalledTappletReqPayload>) => {
      state.isFetching = true
    },
    deleteInstalledTappletSuccess: (state, _: PayloadAction<DeleteInstalledTappletSuccessPayload>) => {
      state.isFetching = false
    },
    deleteInstalledTappletFailure: (state, _: PayloadAction<DeleteInstalledTappletFailurePayload>) => {
      state.isFetching = false
    },
    addInstalledTappletRequest: (state, _: PayloadAction<AddInstalledTappletReqPayload>) => {
      state.isFetching = true
    },
    addInstalledTappletSuccess: (state, _: PayloadAction<AddInstalledTappletSuccessPayload>) => {
      state.isFetching = false
    },
    addInstalledTappletFailure: (state, _: PayloadAction<AddInstalledTappletFailurePayload>) => {
      state.isFetching = false
    },
  },
})

export const installedTappletsActions = installedTappletsSlice.actions
export const installedTappletsReducer = installedTappletsSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(deleteInstalledTappletAction())
listenerMiddleware.startListening(addInstalledTappletAction())
