import { ReactNode, createContext, useEffect, useRef, useState } from "react"
import { permissions as walletPermissions, TariPermissions } from "@tariproject/tarijs"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
import { useTransactionConfirmation } from "./TransactionConfirmationContext"
import { useDispatch } from "react-redux"
import { errorActions } from "./store/error/error.slice"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

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

type TariUniverseProviderContextType = WalletDaemonTariProvider | null
export const TariUniverseProviderContext = createContext<TariUniverseProviderContextType>(null)

interface TariUniverseProviderProps {
  children: ReactNode
}

export const TariUniverseContextProvider: React.FC<TariUniverseProviderProps> = ({ children }) => {
  const provider = useRef<WalletDaemonTariProvider | null>(null)
  const [providerState, setProviderState] = useState<WalletDaemonTariProvider | null>(null)
  const dispatch = useDispatch()
  const { showTransactionConfirmation } = useTransactionConfirmation()

  useEffect(() => {
    const initProvider = async () => {
      return await WalletDaemonTariProvider.build(params)
    }
    initProvider()
      .then((initProvider) => {
        provider.current = initProvider
        setProviderState(initProvider)
      })
      .catch((error) => {
        dispatch(errorActions.showError({ message: error as string }))
      })

    const handleMessage = async (event: any) => {
      if (!provider.current) {
        dispatch(errorActions.showError({ message: "Provider is not initialized yet" as string }))
        return
      }

      const { methodName, args } = event.data
      if (methodName === "submitTransaction") {
        const resultError = "Transaction was cancelled"
        try {
          await new Promise<void>((resolve, reject) =>
            showTransactionConfirmation(
              methodName,
              () => resolve(),
              () => reject(resultError)
            )
          )
        } catch (e) {
          event.source.postMessage({ id: event.data.id, result: {}, resultError, type: "provider-call" }, event.origin)
          return
        }
      }
      const result = await provider.current.runOne(methodName, args)
      event.source.postMessage({ id: event.data.id, result, type: "provider-call" }, event.origin)
    }
    window.addEventListener("message", handleMessage, false)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  return <TariUniverseProviderContext.Provider value={providerState}>{children}</TariUniverseProviderContext.Provider>
}
