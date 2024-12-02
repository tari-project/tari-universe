import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { transactionActions } from "./transaction.slice"
import { InitTransactionRequestPayload, Transaction, TransactionRequestPayload } from "./transaction.types"
import { errorActions } from "../error/error.slice"
import { simulationActions } from "../simulation/simulation.slice"
import { ErrorSource } from "../error/error.types"
import { SubmitTransactionRequest, TransactionStatus } from "@tari-project/tarijs"

import { FinalizeResult, AccountsGetBalancesResponse } from "@tari-project/typescript-bindings"
import { BalanceUpdate, TxSimulation } from "../simulation/simulation.types"
import { txCheck } from "@type/transaction"

export const addTransactionAction = () => ({
  actionCreator: transactionActions.addTransaction,
  effect: async (
    action: PayloadAction<TransactionRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
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
    const { id, submit, methodName } = action.payload.transaction
    const dispatch = listenerApi.dispatch

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
    const dispatch = listenerApi.dispatch

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
      const dispatch = listenerApi.dispatch
      const provider = action.payload.provider
      const event = action.payload.event

      if (!event.source) {
        dispatch(errorActions.showError({ message: "no-source-in-event", errorSource: ErrorSource.FRONTEND }))
        return
      }
      if (!event?.data?.args || !event?.data?.methodName) {
        dispatch(errorActions.showError({ message: "no-data-in-event", errorSource: ErrorSource.FRONTEND }))
        return
      }

      const { methodName, args, id } = event.data

      const runSimulation = async (): Promise<{ balanceUpdates: BalanceUpdate[]; txSimulation: TxSimulation }> => {
        if (methodName !== "submitTransaction") {
          return {
            balanceUpdates: [],
            txSimulation: {
              status: TransactionStatus.InvalidTransaction,
              errorMsg: `Simulation for ${methodName} not supported`,
            },
          }
        }
        const transactionReq: SubmitTransactionRequest = { ...args[0], is_dry_run: true }
        const tx = await provider.runOne(methodName, [transactionReq])

        await provider.client.waitForTransactionResult({
          transaction_id: tx.transaction_id,
          timeout_secs: 10,
        })
        const txReceipt = await provider.getTransactionResult(tx.transaction_id)
        const txResult = txReceipt.result as FinalizeResult | null
        if (!txResult?.result)
          return {
            balanceUpdates: [],
            txSimulation: {
              status: TransactionStatus.InvalidTransaction,
              errorMsg: "Transaction result undefined",
            },
          }

        const txSimulation: TxSimulation = {
          status: txReceipt.status,
          errorMsg: txCheck.isReject(txResult?.result) ? (txResult.result.Reject as string) : "",
        }

        if (!txCheck.isAccept(txResult.result)) return { balanceUpdates: [], txSimulation }

        let walletBalances: AccountsGetBalancesResponse
        try {
          // const walletBalances: AccountsGetBalancesResponse = await invoke("get_balances", {}) //TODO this always fails so used another fct as below
          walletBalances = await provider.client.accountsGetBalances({
            account: null,
            refresh: true,
          })
        } catch (error) {
          console.error(error)
          const e = typeof error === "string" ? error : "Get balances error"
          dispatch(errorActions.showError({ message: e, errorSource: ErrorSource.FRONTEND }))
        }

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
            if (!userBalance) return undefined
            return {
              vaultAddress: substateId.Vault,
              tokenSymbol: userBalance.token_symbol || "",
              currentBalance: userBalance.balance,
              newBalance: substate.Vault.resource_container.Fungible.amount,
            }
          })
          .filter((vault): vault is BalanceUpdate => vault !== undefined)
        return { balanceUpdates, txSimulation }
      }

      const submit = async () => {
        try {
          const result = await provider.runOne(methodName, args)

          if (event.source) {
            event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
          }
        } catch (error) {
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
        dispatch(transactionActions.addTransaction({ transaction }))
      } else {
        dispatch(transactionActions.sendTransactionRequest({ transaction }))
      }
    } catch (error) {
      listenerApi.dispatch(transactionActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
