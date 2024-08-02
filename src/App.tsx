import "./App.css"
import "./i18initializer"
import { ActiveTapplet } from "./components/ActiveTapplet"
import { TabKey } from "./views/Tabs"
import { Wallet } from "./components/Wallet"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { TappletsRegistered } from "./components/TappletsRegistered"
import { TappletsInstalled } from "./components/TappletsInstalled"
import { ActiveDevTapplet } from "./components/DevTapplet"
import { Button, Grid, Stack } from "@mui/material"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { providerActions } from "./store/provider/provider.slice"
import { registeredTappletsActions } from "./store/registeredTapplets/registeredTapplets.slice"
import { installedTappletsActions } from "./store/installedTapplets/installedTapplets.slice"
import { devTappletsActions } from "./store/devTapplets/devTapplets.slice"
import { changeLanguage } from "i18next"
import { Language, LanguageList } from "./i18initializer"
import { useTranslation } from "react-i18next"
import { metadataActions } from "./store/metadata/metadata.slice"

function App() {
  const { t } = useTranslation("navigation")
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(providerActions.initializeRequest({}))
    dispatch(registeredTappletsActions.initializeRequest({}))
    dispatch(installedTappletsActions.initializeRequest({}))
    dispatch(devTappletsActions.initializeRequest({}))
  }, [])

  const handleLanguageChange = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, language: Language) => {
      event.preventDefault()
      event.stopPropagation()
      changeLanguage(language)
      dispatch(metadataActions.changeCurrentLanguage({ language }))
    },
    []
  )

  return (
    <Stack height="100%">
      <BrowserRouter>
        <Grid gridTemplateColumns="repeat(5, 1fr)" gridTemplateRows="1fr" columnGap={0} rowGap={0} display="grid">
          <Stack direction="row" gap={4} gridArea="1 / 2 / 2 / 5" width="100%" justifyContent="center">
            <Link to={TabKey.WALLET} className="nav-item">
              {t("wallet")}
            </Link>
            <Link to={TabKey.TAPPLET_REGISTRY} className="nav-item">
              {t("tapplet-registry")}
            </Link>
            <Link to={TabKey.INSTALLED_TAPPLETS} className="nav-item">
              {t("installed-tapplets")}
            </Link>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" gap={2} gridArea="1 / 5 / 2 / 6">
            {LanguageList.map((langauge) => (
              <Button sx={{ alignSelf: "center" }} onClick={(event) => handleLanguageChange(event, langauge)}>
                {langauge}
              </Button>
            ))}
          </Stack>
        </Grid>

        <Routes>
          <Route path={TabKey.WALLET} element={<Wallet key={TabKey.WALLET}></Wallet>} />
          <Route path={TabKey.TAPPLET_REGISTRY} element={<TappletsRegistered key={TabKey.TAPPLET_REGISTRY} />} />
          <Route path={TabKey.INSTALLED_TAPPLETS} element={<TappletsInstalled key={TabKey.INSTALLED_TAPPLETS} />} />
          <Route path={`${TabKey.ACTIVE_TAPPLET}/:id`} element={<ActiveTapplet key={TabKey.ACTIVE_TAPPLET} />} />
          <Route path={`${TabKey.DEV_TAPPLETS}/:id`} element={<ActiveDevTapplet key={TabKey.DEV_TAPPLETS} />} />
        </Routes>
      </BrowserRouter>
    </Stack>
  )
}

export default App
