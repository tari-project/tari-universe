import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { TransactionEvent } from "@type/transaction"
import { InitProviderRequestPayload, TransactionRequestPayload } from "../provider.types"
import { providerActions } from "../provider.slice"
import { transactionActions } from "../../transaction/transaction.slice"
import { TransactionData } from "../../transaction/transaction.types"
import { errorActions } from "../../error/error.slice"
import { RootState } from "../../store"
import { providerSelector } from "../provider.selector"

export const initializeAction = () => ({
  actionCreator: providerActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const dispatch = listenerApi.dispatch
      const state = listenerApi.getState() as RootState
      const provider = providerSelector.selectProvider(state)

      const handleMessage = async (event: MessageEvent<TransactionEvent>) => {
        if (!event?.data?.args || !event?.data?.methodName) {
          console.error("No data in event", event)
          dispatch(errorActions.showError({ message: "No data in event" }))
          return
        }
        if (!event.source) {
          dispatch(errorActions.showError({ message: "No source in event" }))
          return
        }

        const { methodName, args, id } = event.data
        if (methodName === "submitTransaction") {
          console.log(args, methodName)
          const transaction: TransactionData = {
            id,
            eventSource: event.source.postMessage,
          }
          dispatch(
            transactionActions.showDialog({
              methodName: methodName,
              args,
              transaction,
            })
          )
          return
        }

        const result = await provider.runOne(methodName, args)
        event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
      }
      window.addEventListener("message", handleMessage, false)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const confirmTransactionAction = () => ({
  actionCreator: transactionActions.submit,
  effect: async (
    action: PayloadAction<TransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const state = listenerApi.getState() as RootState
    const provider = state.provider.provider
    const dispatch = listenerApi.dispatch

    if (!provider) {
      dispatch(errorActions.showError({ message: "Provider not initialized" }))
      dispatch(transactionActions.hideDialog())
      return
    }

    try {
      const { id, eventSource, methodName, args } = action.payload
      const result = await provider.runOne(methodName, args)
      eventSource?.({ id, result, type: "provider-call" }, { targetOrigin: window.origin })
      dispatch(transactionActions.hideDialog())
    } catch (error) {
      let message = "Error while executing transaction"
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === "string") {
        message = error
      }
      dispatch(errorActions.showError({ message }))
      dispatch(transactionActions.hideDialog())
    }
  },
})
