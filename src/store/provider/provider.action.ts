import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { TransactionEvent } from "@type/transaction"
import { InitProviderRequestPayload } from "./provider.types"
import { providerActions } from "./provider.slice"
import { transactionActions } from "../transaction/transaction.slice"
import { Transaction } from "../transaction/transaction.types"
import { errorActions } from "../error/error.slice"
import { RootState } from "../store"
import { providerSelector } from "./provider.selector"

let handleMessage: typeof window.postMessage

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

      handleMessage = async (event: MessageEvent<TransactionEvent>) => {
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
          const postMsg = async () => {
            try {
              const result = await provider.runOne(methodName, args)
              if (event.source) {
                event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
              }
            } catch (error) {
              dispatch(errorActions.showError({ message: error as string }))
            }
          }
          const transaction: Transaction = {
            eventSource: postMsg,
            eventOrigin: event.origin,
            status: "pending",
            methodName,
            args,
            id,
          }
          dispatch(transactionActions.addTransaction({ transaction }))
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
