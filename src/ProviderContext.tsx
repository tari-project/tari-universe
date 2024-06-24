import { ReactNode, createContext, useEffect, useRef } from "react"
import { permissions as walletPermissions, TariPermissions } from "@tariproject/tarijs"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/wallet_daemon"
import { useSnackBar } from "./ErrorContext"

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

export type TariUniverseProviderContextType = WalletDaemonTariProvider | null

const TariUniverseProviderContext = createContext<TariUniverseProviderContextType>(null)

interface TariUniverseProviderProps {
  children: ReactNode
}

export const TariUniverseContextProvider: React.FC<TariUniverseProviderProps> = ({ children }) => {
  const provider = useRef<WalletDaemonTariProvider | null>(null)
  const { showSnackBar } = useSnackBar()
  useEffect(() => {
    const initProvider = async () => {
      const newProvider = await WalletDaemonTariProvider.build(params)
      provider.current = newProvider
    }
    initProvider().catch((e) => {
      showSnackBar(`Failed to initialize provider ${e.message}`, "error")
    })

    const handleMessage = async (event: any) => {
      if (!provider.current) {
        showSnackBar("Provider is not initialized yet", "error")
        return
      }

      const { methodName, args } = event.data
      const result = await provider.current.runOne(methodName, args)
      event.source.postMessage({ id: event.data.id, result, type: "provider-call" }, event.origin)
    }
    window.addEventListener("message", handleMessage, false)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])
  const providerValue = provider.current
  return <TariUniverseProviderContext.Provider value={providerValue}>{children}</TariUniverseProviderContext.Provider>
}
