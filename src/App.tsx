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
import { TappletListItemProps, TappletsList } from "./components/TappletsList"
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
const tappletRegistry: TappletListItemProps[] = [
  {
    name: "Ene",
    icon: reactLogo,
    installed: true,
  },
  {
    name: "Due",
    icon: reactLogo,
    installed: true,
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

//TODO parse json to registry struct
const installedTappletList: TappletListItemProps[] = [
  {
    name: "Ene",
    icon: reactLogo,
    installed: true,
  },
  {
    name: "Due",
    icon: reactLogo,
    installed: true,
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
              component: <TappletsList key={TabKey.TAPPLET_REGISTRY} tapplets={tappletRegistry} />,
            },
            {
              id: "installed-tapplets",
              name: "Installed Tapplets",
              component: <TappletsList key={TabKey.INSTALLED_TAPPLETS} tapplets={installedTappletList} />,
            },
            {
              id: "tapplet",
              name: "Tapplet",
              component: <Tapplet key={TabKey.ACTIVE_TAPPLET} tappletId={TAPPLET_ID} />,
            },
          ]}
        />
      </div>
    </div>
  )
}

export default App
