import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet, TappletConfig } from "@type/tapplet"
import { useEffect, useState } from "react"
import { Tapplet } from "./Tapplet"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { ErrorSource } from "../store/error/error.types"
import { tappletProvidersActions } from "../store/tappletProviders/tappletProviders.slice"
import { RootState } from "../store/store"
import { getTappProviderId, selectTappProviderById } from "../helpers/provider"

export function ActiveDevTapplet() {
  let { state: devTapplet }: { state: DevTapplet } = useLocation()
  const dispatch = useDispatch()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const tappProviderId = getTappProviderId({ devTappletId: devTapplet.id })
  const tappProvider = useSelector((state: RootState) => selectTappProviderById(state, tappProviderId))

  useEffect(() => {
    const fetchTappletConfig = async () => {
      try {
        const config: TappletConfig = await (await fetch(`${devTapplet?.endpoint}/tapplet.config.json`)).json() //TODO add const as path to config

        if (config?.packageName === devTapplet?.package_name) {
          setIsVerified(true)

          if (!config?.permissions) {
            dispatch(
              errorActions.showError({
                message: `failed-to-fetch-tapp-config | error-${"Tapplet permissions undefined"}`,
                errorSource: ErrorSource.BACKEND,
              })
            )
            return
          }

          if (!tappProvider) {
            dispatch(
              tappletProvidersActions.addTappProviderReq({
                id: tappProviderId,
                launchedTappParams: {
                  endpoint: devTapplet?.endpoint,
                  permissions: config.permissions,
                },
              })
            )
            return
          }

          dispatch(
            tappletProvidersActions.updateTappProviderRequest({
              id: tappProviderId,
              permissions: config.permissions,
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

    if (devTapplet?.endpoint) {
      fetchTappletConfig()
    }
  }, [])

  return (
    <Box height="100%">
      {isVerified && tappProvider && <Tapplet source={devTapplet.endpoint} provider={tappProvider} />}
    </Box>
  )
}
