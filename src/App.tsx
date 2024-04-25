import { invoke } from "@tauri-apps/api/core"
import "./App.css"
import { useEffect } from "react"
import { TariPermissions, WalletDaemonParameters, WalletDaemonTariProvider } from "./provider"
import {
  TariPermissionAccountInfo,
  TariPermissionKeyList,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
} from "./provider/permissions"
import { Tapplet } from "./components/Tapplet"
import { TabKey, Tabs } from "./views/Tabs"
import { Wallet } from "./components/Wallet"
import { RegisteredTapplet, TappletRegistry } from "./components/TappletRegistry"
import reactLogo from "./assets/react.svg"

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

const TAPPLET_ID = "tapplet_id"
//TODO parse json to registry struct
const tappletList: RegisteredTapplet[] = [
  {
    name: "Ene",
    icon: reactLogo,
  },
  {
    name: "Due",
    icon: reactLogo,
  },
  {
    name: "Rike",
    icon: reactLogo,
  },
  {
    name: "Fake",
    icon: reactLogo,
  },
]
function App() {
  useEffect(() => {
    const handleMessage = async (event: any) => {
      const { methodName, args } = event.data
      const result = await provider.runOne(methodName, args)
      event.source.postMessage({ id: event.id, result }, event.origin)
    }

    window.addEventListener("message", handleMessage, false)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  return (
    <div className="container">
      <div style={{ marginTop: "24px" }}>
        <Tabs
          tabs={[
            {
              id: "wallet",
              name: "Wallet",
              component: <Wallet key={TabKey.WALLET} />,
            },
            {
              id: "tapplet-registry",
              name: "Tapplet Registry",
              component: <TappletRegistry key={TabKey.TAPPLET_REGISTRY} tapplets={tappletList} />,
            },

            {
              id: "tapplet",
              name: "Tapplet",
              component: <Tapplet key={TabKey.TAPPLET} tappletId={TAPPLET_ID} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default App
