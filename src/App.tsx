import "./App.css"
import { ActiveTapplet } from "./components/ActiveTapplet"
import { TabKey } from "./views/Tabs"
import { Wallet } from "./components/Wallet"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { TappletsRegistered } from "./components/TappletsRegistered"
import { TappletsInstalled } from "./components/TappletsInstalled"
import { ActiveDevTapplet } from "./components/DevTapplet"
import { Box } from "@mui/material"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { providerActions } from "./store/provider/provider.slice"
import { registeredTappletsActions } from "./store/registeredTapplets/registeredTapplets.slice"
import { installedTappletsActions } from "./store/installedTapplets/installedTapplets.slice"
import { devTappletsActions } from "./store/devTapplets/devTapplets.slice"

function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(providerActions.initializeRequest({}))
    dispatch(registeredTappletsActions.initializeRequest({}))
    dispatch(installedTappletsActions.initializeRequest({}))
    dispatch(devTappletsActions.initializeRequest({}))
  }, [])
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <BrowserRouter>
        <Box p={4} display="flex" alignItems="center" justifyContent="center" gap={4}>
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
    </Box>
  )
}

export default App
