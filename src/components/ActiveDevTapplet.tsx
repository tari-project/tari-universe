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
import { RootState } from "../store/store"

const selectTappProviderById = (state: RootState, id?: number) =>
  id ? tappletProviderSelector.getTappletProviderById(state, id) : null

export function ActiveDevTapplet() {
  let { state: devTapplet }: { state: DevTapplet } = useLocation()
  const dispatch = useDispatch()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const tappProvider = useSelector((state: RootState) => selectTappProviderById(state, Number(devTapplet.id)))
  console.log("^^^ tp", tappProvider)

  useEffect(() => {
    const fetchTappletConfig = async () => {
      try {
        const config: TappletConfig = await (await fetch(`${devTapplet?.endpoint}/tapplet.config.json`)).json() //TODO add const as path to config
        console.log("DEV TAPP")
        if (config?.packageName === devTapplet?.package_name) {
          setIsVerified(true)
          console.log("DEV TAPP config", config)
          console.log("DEV TAPP devTapplet", devTapplet)
          if (config?.permissions) {
            if (Number(devTapplet.id) != tappProvider?.id) {
              console.log("DEV TAPP dispatch")
              dispatch(
                tappletProvidersActions.addTappProviderReq({
                  installedTappletId: Number(devTapplet.id),
                  launchedTappParams: {
                    endpoint: devTapplet?.endpoint,
                    permissions: config.permissions,
                  },
                })
              )
            } else {
              // not sure if we should update it every time but I dont think so
              // TODO check if update needed
              dispatch(
                tappletProvidersActions.updateTappProviderRequest({
                  tappletId: Number(devTapplet.id),
                  permissions: config.permissions,
                })
              )
            }
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
              message: `manifest-package-name-mismatch | expectedPackageName-${devTapplet?.package_name} & receivedPackageName-${config?.packageName} & endpoint-${devTapplet?.endpoint}`,
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

    if (devTapplet?.endpoint) {
      fetchTappletConfig()
    }
  }, [])

  return (
    <Box height="100%">
      {isVerified && tappProvider && <Tapplet source={devTapplet.endpoint} provider={tappProvider.provider} />}
    </Box>
  )
}
