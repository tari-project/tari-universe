import "./App.css"
import { useEffect, useRef } from "react"
import {
  TariPermissionAccountInfo,
  TariPermissionKeyList,
  TariPermissionSubstatesRead,
  TariPermissionTransactionSend,
  TariPermissions,
} from "@provider/permissions"
import { ActiveTapplet } from "./components/ActiveTapplet"
import { TabKey } from "./views/Tabs"
import { Wallet } from "./components/Wallet"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { TappletsRegistered } from "./components/TappletsRegistered"
import { TappletsInstalled } from "./components/TappletsInstalled"
import { ActiveDevTapplet } from "./components/DevTapplet"
import { WalletDaemonParameters, WalletDaemonTariProvider } from "@provider/wallet_daemon"
import { Box } from "@mui/material"
import { useSnackBar } from "./ErrorContext"

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

function App() {
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
          <Box pb={4}>
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
          </Box>

          <Routes>
            <Route path={TabKey.WALLET} element={<Wallet key={TabKey.WALLET}></Wallet>} />
            <Route path={TabKey.TAPPLET_REGISTRY} element={<TappletsRegistered key={TabKey.TAPPLET_REGISTRY} />} />
            <Route path={TabKey.INSTALLED_TAPPLETS} element={<TappletsInstalled key={TabKey.INSTALLED_TAPPLETS} />} />
            <Route path={`${TabKey.ACTIVE_TAPPLET}/:id`} element={<ActiveTapplet key={TabKey.ACTIVE_TAPPLET} />} />
            <Route path={`${TabKey.DEV_TAPPLETS}/:id`} element={<ActiveDevTapplet key={TabKey.DEV_TAPPLETS} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
