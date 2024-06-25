import { ReactNode, createContext, useEffect, useRef, useState } from "react"
import { permissions as walletPermissions, TariPermissions } from "@tariproject/tarijs"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/TariUniverseProvider"
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

type TariUniverseProviderContextType = WalletDaemonTariProvider | null
export const TariUniverseProviderContext = createContext<TariUniverseProviderContextType>(null)

interface TariUniverseProviderProps {
  children: ReactNode
}

export const TariUniverseContextProvider: React.FC<TariUniverseProviderProps> = ({ children }) => {
  const provider = useRef<WalletDaemonTariProvider | null>(null)
  const [providerState, setProviderState] = useState<WalletDaemonTariProvider | null>(null)
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const initProvider = async () => {
      return await WalletDaemonTariProvider.build(params)
    }
    initProvider()
      .then((initProvider) => {
        provider.current = initProvider
        setProviderState(initProvider)
      })
      .catch((e) => {
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

  return <TariUniverseProviderContext.Provider value={providerState}>{children}</TariUniverseProviderContext.Provider>
}
