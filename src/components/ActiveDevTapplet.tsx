import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet, TappletConfig } from "@type/tapplet"
import { useEffect, useState } from "react"
import { Tapplet } from "./Tapplet"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { ErrorSource } from "../store/error/error.types"
import { tappletProvidersActions } from "../store/tappletProviders/tappletProviders.slice"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const dispatch = useDispatch()
  const tappProvs = useSelector(tappletProviderSelector.getAllTappletProviders)
  console.log("all tap prov", tappProvs)

  useEffect(() => {
    const fetchTappletConfig = async () => {
      try {
        const response = await fetch(`${state?.endpoint}/src/tapplet.config.json`)
        const config: TappletConfig = await response.json()
        console.log("DEV TAPP")
        if (config?.packageName === state?.package_name) {
          setIsVerified(true)
          console.log("DEV TAPP config", config)
          console.log("DEV TAPP state", state)
          if (config?.permissions) {
            console.log("DEV TAPP dispatch")
            dispatch(
              tappletProvidersActions.addTappProviderReq({
                installedTappletId: Number(state.id), //TODO get unique ID
                launchedTappParams: {
                  endpoint: state?.endpoint,
                  permissions: config.permissions,
                },
              })
            ) //TODO
            console.log("DEV TAPP dispatch 2")
          } else {
            dispatch(
              errorActions.showError({
                message: `failed-to-fetch-tapp-config | error-${"Tapplet permissions undefined"}`,
                errorSource: ErrorSource.BACKEND,
              })
            )
          }
        } else {
          dispatch(
            errorActions.showError({
              message: `manifest-package-name-mismatch | expectedPackageName-${state?.package_name} & receivedPackageName-${config?.packageName} & endpoint-${state?.endpoint}`,
              errorSource: ErrorSource.BACKEND,
            })
          )
        }
      } catch (error) {
        dispatch(
          errorActions.showError({
            message: `failed-to-fetch-tapp-config | error-${error}`,
            errorSource: ErrorSource.BACKEND,
          })
        )
      }
    }

    if (state?.endpoint) {
      fetchTappletConfig()
    }
  }, [])

  return <Box height="100%">{isVerified && <Tapplet source={state.endpoint} tappletId={Number(state.id)} />}</Box>
}
