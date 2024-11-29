import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { TransactionEvent } from "@type/transaction"
import { InitProviderRequestPayload, UpdatePermissionsRequestPayload } from "./provider.types"
import { providerActions } from "./provider.slice"
import { transactionActions } from "../transaction/transaction.slice"
import { Transaction, TUProviderMethod } from "../transaction/transaction.types"
import { errorActions } from "../error/error.slice"
import { RootState } from "../store"
import { providerSelector } from "./provider.selector"
import { SubmitTransactionRequest, TransactionStatus } from "@tari-project/tarijs"
import { invoke } from "@tauri-apps/api/core"
import {
  SubstateDiff,
  TransactionResult,
  FinalizeResult,
  VaultId,
  Vault,
  SubstateId,
  SubstateValue,
  ResourceContainer,
  ResourceAddress,
  Amount,
  RejectReason,
} from "@tari-project/typescript-bindings"
import { AccountsGetBalancesResponse } from "@tari-project/wallet_jrpc_client"
import { BalanceUpdate, TxSimulation } from "../simulation/simulation.types"
import { ErrorSource } from "../error/error.types"

let handleMessage: typeof window.postMessage

const isAccept = (result: TransactionResult): result is { Accept: SubstateDiff } => {
  return "Accept" in result
}

const isReject = (result: TransactionResult): result is { Reject: RejectReason } => {
  return "Reject" in result
}

const isVaultId = (substateId: SubstateId): substateId is { Vault: VaultId } => {
  return "Vault" in substateId
}

const isVaultSubstate = (substate: SubstateValue): substate is { Vault: Vault } => {
  return "Vault" in substate
}

type Fungible = { Fungible: { address: ResourceAddress; amount: Amount; locked_amount: Amount } }

const isFungible = (resourceContainer: ResourceContainer): resourceContainer is Fungible => {
  return "Fungible" in resourceContainer
}

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
          return
        }
        if (!event.source) {
          dispatch(errorActions.showError({ message: "no-source-in-event", errorSource: ErrorSource.FRONTEND }))
          return
        }

        const { methodName, args, id } = event.data
        const method = methodName as TUProviderMethod
        // tx simulation
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
          const tx = await provider.runOne(method, [transactionReq])
          
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
            errorMsg: isReject(txResult?.result) ? (txResult.result.Reject as string) : "",
          }

          if (!isAccept(txResult.result)) return { balanceUpdates: [], txSimulation }

          let walletBalances: AccountsGetBalancesResponse

          try {
            walletBalances = await invoke("get_balances", {})
          } catch (error) {
            console.error(error)
            const e = typeof error === "string" ? error : "Get balances error"
            dispatch(errorActions.showError({ message: e, errorSource: ErrorSource.FRONTEND }))
          }

          const { up_substates } = txResult.result.Accept
          const balanceUpdates: BalanceUpdate[] = up_substates
            .map((upSubstate) => {
              const [substateId, { substate }] = upSubstate
              if (!isVaultId(substateId) || !isVaultSubstate(substate)) return undefined
              if (!isFungible(substate.Vault.resource_container)) return undefined
              const userBalance = walletBalances.balances.find((balance) => {
                if (!isVaultId(balance.vault_address)) return false
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
        // tx submit
        const submit = async () => {
          try {
            const result = await provider.runOne(method, args)
            if (event.source) {
              event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
            }
          } catch (error) {
            console.error(error)
            const e = typeof error === "string" ? error : "Provider send request error"
            dispatch(errorActions.showError({ message: e, errorSource: ErrorSource.FRONTEND }))
          }
        }
        // tx cancel
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
          methodName: method,
          args,
          id,
        }
        if (method === "submitTransaction") {
          dispatch(transactionActions.addTransaction({ transaction }))
        } else {
          dispatch(transactionActions.sendTransactionRequest({ transaction }))
        }
      }
      window.addEventListener("message", handleMessage, false)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const updatePermissionsAction = () => ({
  actionCreator: providerActions.updatePermissionsRequest,
  effect: async (
    action: PayloadAction<UpdatePermissionsRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    const permissions = action.payload.permissions
    try {
      listenerApi.dispatch(providerActions.updatePermissionsSuccess({ permissions }))
    } catch (error) {
      listenerApi.dispatch(providerActions.updatePermissionsFailure({ errorMsg: error as string }))
    }
  },
})
