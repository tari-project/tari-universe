import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { transactionActions } from "./transaction.slice"
import { TransactionRequestPayload } from "./transaction.types"
import { errorActions } from "../error/error.slice"
import { RootState } from "../store"

export const executeTransactionAction = () => ({
  actionCreator: transactionActions.sendTransactionRequest,
  effect: async (
    action: PayloadAction<TransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const { id, submit } = action.payload.transaction
    const state = listenerApi.getState() as RootState
    const provider = state.provider.provider
    const dispatch = listenerApi.dispatch

    if (!provider) {
      dispatch(transactionActions.sendTransactionFailure({ id, errorMsg: "Provider not initialized" }))
      return
    }

    try {
      submit()
      dispatch(transactionActions.sendTransactionSuccess({ id }))
    } catch (error) {
      let message = "Error while executing transaction"
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === "string") {
        message = error
      }
      dispatch(transactionActions.sendTransactionFailure({ id, errorMsg: message }))
    }
  },
})

export const cancelTransactionAction = () => ({
  actionCreator: transactionActions.cancelTransaction,
  effect: async (
    action: PayloadAction<TransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const { id, cancel } = action.payload.transaction
    const state = listenerApi.getState() as RootState
    const provider = state.provider.provider
    const dispatch = listenerApi.dispatch

    if (!provider) {
      dispatch(transactionActions.sendTransactionFailure({ id, errorMsg: "Provider not initialized" }))
      return
    }

    try {
      cancel()
      dispatch(transactionActions.sendTransactionSuccess({ id }))
    } catch (error) {
      let message = "Error while executing transaction"
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === "string") {
        message = error
      }
      dispatch(transactionActions.sendTransactionFailure({ id, errorMsg: message }))
    }
  },
})

export const transactionFailedAction = () => ({
  actionCreator: transactionActions.sendTransactionFailure,
  effect: async (
    action: PayloadAction<{ id: number; errorMsg: string }>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const dispatch = listenerApi.dispatch

    dispatch(errorActions.showError({ message: action.payload.errorMsg }))
  },
})
