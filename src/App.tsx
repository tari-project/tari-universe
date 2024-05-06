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
import { TabKey } from "./views/Tabs"
import { Wallet } from "./components/Wallet"
import { TappletListItemProps, TappletsList } from "./components/TappletsList"
import reactLogo from "./assets/react.svg"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

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
    name: "Installed tapplet example",
    icon: reactLogo,
    installed: true,
  },
  {
    name: "Tapplet 2",
    icon: reactLogo,
    installed: false,
  },
  {
    name: "Tapplet 3",
    icon: reactLogo,
  },
  {
    name: "Tapplet 4",
    icon: reactLogo,
  },
]

//TODO parse json to registry struct
const installedTappletList: TappletListItemProps[] = [
  {
    name: "Installed tapplet example",
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
      <div style={{ marginTop: "1px" }}>
        <BrowserRouter>
          <div>
            <Link to={TabKey.WALLET} className="nav-item">
              {" "}
              Wallet{" "}
            </Link>
            <Link to={TabKey.TAPPLET_REGISTRY} className="nav-item">
              {" "}
              Tapplet Registry{" "}
            </Link>
            <Link to={TabKey.INSTALLED_TAPPLETS} className="nav-item">
              {" "}
              Installed Tapplets{" "}
            </Link>
            <Link to={TabKey.ACTIVE_TAPPLET} className="nav-item">
              {" "}
              Active Tapplet{" "}
            </Link>
          </div>

          <Routes>
            <Route path={TabKey.WALLET} element={<Wallet key={TabKey.WALLET}></Wallet>} />
            <Route
              path={TabKey.TAPPLET_REGISTRY}
              element={<TappletsList tapplets={tappletRegistry} key={TabKey.TAPPLET_REGISTRY} />}
            />
            <Route
              path={TabKey.INSTALLED_TAPPLETS}
              element={<TappletsList tapplets={installedTappletList} key={TabKey.INSTALLED_TAPPLETS} />}
            />

            <Route
              path={TabKey.ACTIVE_TAPPLET}
              element={<Tapplet key={TabKey.ACTIVE_TAPPLET} tappletId={TAPPLET_ID} />}
            />
            <Route
              path={`${TabKey.TAPPLET_REGISTRY}/active-tapplet`}
              element={<Tapplet key={TabKey.ACTIVE_TAPPLET} tappletId={TAPPLET_ID} />}
            />
            <Route
              path={`${TabKey.INSTALLED_TAPPLETS}/active-tapplet`}
              element={<Tapplet key={TabKey.ACTIVE_TAPPLET} tappletId={TAPPLET_ID} />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
