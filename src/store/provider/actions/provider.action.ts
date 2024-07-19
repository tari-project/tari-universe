import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { permissions as walletPermissions, TariPermissions } from "@tariproject/tarijs"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { TransactionEvent } from "@type/transaction"
import { InitProviderRequestPayload } from "../provider.types"
import { providerActions } from "../provider.slice"
import { transactionActions } from "../../transaction/transaction.slice"
import { TransactionData } from "../../transaction/transaction.types"
import { errorActions } from "../../error/error.slice"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

export const initializeAction = () => ({
  actionCreator: providerActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitProviderRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const dispatch = listenerApi.dispatch
      let permissions = new TariPermissions()
      permissions.addPermission(new TariPermissionKeyList())
      permissions.addPermission(new TariPermissionAccountInfo())
      permissions.addPermission(new TariPermissionTransactionSend())
      permissions.addPermission(new TariPermissionSubstatesRead())
      let optionalPermissions = new TariPermissions()
      const params: WalletDaemonParameters = {
        permissions,
        optionalPermissions,
      }

      const provider = await WalletDaemonTariProvider.build(params)

      const handleMessage = async (event: MessageEvent<TransactionEvent>) => {
        if (!event.data) {
          dispatch(errorActions.showError({ message: "No data in event" }))
          return
        }
        if (!event.source) {
          dispatch(errorActions.showError({ message: "No source in event" }))
          return
        }

        const { methodName, args, id } = event.data
        if (methodName === "submitTransaction") {
          const transaction: TransactionData = {
            id,
            eventSource: event.source.postMessage,
          }
          dispatch(
            transactionActions.showDialog({
              methodName: methodName as string,
              args,
              transaction,
            })
          )
          return
        }

        const result = await provider.runOne(methodName, args)
        event.source.postMessage({ id: event.data.id, result, type: "provider-call" }, { targetOrigin: event.origin })
      }
      window.addEventListener("message", handleMessage, false)

      listenerApi.dispatch(providerActions.initializeSuccess({ provider }))
    } catch (error) {
      listenerApi.dispatch(providerActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})
