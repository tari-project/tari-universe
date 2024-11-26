import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { TransactionEvent } from "@type/transaction"
import { InitProviderRequestPayload, UpdatePermissionsRequestPayload } from "./provider.types"
import { providerActions } from "./provider.slice"
import { transactionActions } from "../transaction/transaction.slice"
import { Transaction, TUProviderMethod } from "../transaction/transaction.types"
import { errorActions } from "../error/error.slice"
import { RootState } from "../store"
import { providerSelector } from "./provider.selector"
import { SubmitTransactionRequest } from "@tari-project/tarijs"
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
} from "@tari-project/typescript-bindings"
import { AccountsGetBalancesResponse } from "@tari-project/wallet_jrpc_client"
import { BalanceUpdate } from "../simulation/simulation.types"
import { ErrorSource } from "../error/error.types"

let handleMessage: typeof window.postMessage

const isAccept = (result: TransactionResult): result is { Accept: SubstateDiff } => {
  return "Accept" in result
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
      console.log(">>>>> INIT PROVIDER", provider.providerName)

      handleMessage = async (event: MessageEvent<TransactionEvent>) => {
        if (!event?.data?.args || !event?.data?.methodName) {
          return
        }
        if (!event.source) {
          dispatch(errorActions.showError({ message: "no-source-in-event", errorSource: ErrorSource.FRONTEND }))
          return
        }

        const { methodName, args, id } = event.data
        const _method = methodName as TUProviderMethod
        const runSimulation = async () => {
          if (methodName !== "submitTransaction") {
            return []
          }
          const transactionReq: SubmitTransactionRequest = { ...args[0], is_dry_run: true }
          const tx = await provider.runOne(_method, [transactionReq])
          const txReceipt = await provider.getTransactionResult(tx.transaction_id)

          const walletBalances: AccountsGetBalancesResponse = await invoke("get_balances", {})
          const txResult = txReceipt.result as FinalizeResult
          if (!isAccept(txResult.result)) return []

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
            const result = await provider.runOne(_method, args)
            console.log(">>> result provider action", result)
            if (event.source) {
              console.log(">>> provider action event")
              event.source.postMessage({ id, result, type: "provider-call" }, { targetOrigin: event.origin })
              console.log(">>> provider action event ok")
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
          methodName: _method,
          args,
          id,
        }
        if (_method === "submitTransaction") {
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
      listenerApi.dispatch(providerActions.updatePermissionsSuccess({ permissions: permissions }))
    } catch (error) {
      listenerApi.dispatch(providerActions.updatePermissionsFailure({ errorMsg: error as string }))
    }
  },
})
