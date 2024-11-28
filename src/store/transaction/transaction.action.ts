import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { transactionActions } from "./transaction.slice"
import {
  InitTransactionRequestPayload,
  Transaction,
  TransactionRequestPayload,
  TUProviderMethod,
} from "./transaction.types"
import { errorActions } from "../error/error.slice"
import { RootState } from "../store"
import { simulationActions } from "../simulation/simulation.slice"
import { ErrorSource } from "../error/error.types"
import { SubmitTransactionRequest } from "@tari-project/tarijs"
import { invoke } from "@tauri-apps/api/core"
import { FinalizeResult, AccountsGetBalancesResponse } from "@tari-project/typescript-bindings"
import { BalanceUpdate } from "../simulation/simulation.types"
import { providerActions } from "../provider/provider.slice"
import { txCheck } from "@type/transaction"

export const addTransactionAction = () => ({
  actionCreator: transactionActions.addTransaction,
  effect: async (
    action: PayloadAction<TransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    console.log("[store tx] addTxAction", action.payload.transaction)
    const { id } = action.payload.transaction
    const dispatch = listenerApi.dispatch

    dispatch(simulationActions.runSimulationRequest({ transactionId: id }))
  },
})

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

    dispatch(errorActions.showError({ message: action.payload.errorMsg, errorSource: ErrorSource.BACKEND }))
  },
})

export const initializeTransactionAction = () => ({
  actionCreator: transactionActions.initializeRequest,
  effect: async (
    action: PayloadAction<InitTransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      console.log("[store tx] INIT TRANSACTION WOW")
      const dispatch = listenerApi.dispatch
      const provider = action.payload.provider
      const event = action.payload.event
      console.log("[store tx] init tx event", event)
      console.log("[store tx] init tx provider", provider)

      // const handleMessage = async (event: MessageEvent<TransactionEvent>) => {
      if (!event.source) {
        dispatch(errorActions.showError({ message: "no-source-in-event", errorSource: ErrorSource.FRONTEND }))
        return
      }
      if (!event?.data?.args || !event?.data?.methodName) {
        dispatch(errorActions.showError({ message: "no-data-in-event", errorSource: ErrorSource.FRONTEND }))
        return
      }

      const { methodName, args, id } = event.data
      console.log("[store tx] INIT TRANSACTION method", methodName)
      const runSimulation = async () => {
        if (methodName !== "submitTransaction") {
          return []
        }
        const transactionReq: SubmitTransactionRequest = { ...args[0], is_dry_run: true }
        const tx = await provider.runOne(methodName, [transactionReq])
        const txReceipt = await provider.getTransactionResult(tx.transaction_id)

        const walletBalances: AccountsGetBalancesResponse = await invoke("get_balances", {})
        const txResult = txReceipt.result as FinalizeResult
        if (!txCheck.isAccept(txResult.result)) return []

        const { up_substates } = txResult.result.Accept

        const balanceUpdates: BalanceUpdate[] = up_substates
          .map((upSubstate) => {
            const [substateId, { substate }] = upSubstate
            if (!txCheck.isVaultId(substateId) || !txCheck.isVaultSubstate(substate)) return undefined
            if (!txCheck.isFungible(substate.Vault.resource_container)) return undefined
            const userBalance = walletBalances.balances.find((balance) => {
              if (!txCheck.isVaultId(balance.vault_address)) return false
              return balance.vault_address.Vault === substateId.Vault
            })
            if (!userBalance) return
            return {
              vaultAddress: substateId.Vault,
              tokenSymbol: userBalance.token_symbol || "",
              currentBalance: userBalance.balance,
              newBalance: substate.Vault.resource_container.Fungible.amount,
            }
          })
          .filter((vault): vault is BalanceUpdate => vault !== undefined)
        return balanceUpdates
      }
      const submit = async () => {
        try {
          const result = await provider.runOne(methodName, args)
          console.log("[store tx] SUBMIT: result provider action", result)
          if (event.source) {
            console.log("[store tx] SUBMIT: provider action event")
            event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
            console.log("[store tx] SUBMIT: provider action event ok")
          }
        } catch (error) {
          console.log("[store tx] SUBMIT: provider action event error")
          console.error(error)
          const e = typeof error === "string" ? error : "Provider send request error"
          dispatch(errorActions.showError({ message: e, errorSource: ErrorSource.FRONTEND }))
        }
      }
      const cancel = async () => {
        if (event.source) {
          event.source.postMessage(
            { id, result: {}, resultError: "Transaction was cancelled", type: "provider-call" },
            { targetOrigin: event.origin }
          )
        }
      }
      const transaction: Transaction = {
        submit,
        cancel,
        runSimulation,
        status: "pending",
        methodName: methodName,
        args,
        id,
      }
      if (methodName === "submitTransaction") {
        console.log("[store tx] tx action add tx", methodName)
        dispatch(transactionActions.addTransaction({ transaction }))
      } else {
        console.log("[store tx] tx action send request", methodName)
        dispatch(transactionActions.sendTransactionRequest({ transaction }))
      }
    } catch (error) {
      listenerApi.dispatch(transactionActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
