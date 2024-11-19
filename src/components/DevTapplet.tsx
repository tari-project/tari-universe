import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet, TappletConfig } from "@type/tapplet"
import { useEffect, useState } from "react"
import { Tapplet } from "./Tapplet"
import { useDispatch } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { ErrorSource } from "../store/error/error.types"
import { providerActions } from "../store/provider/provider.slice"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchTappletManifest = async () => {
      try {
        // const response = await fetch(`${state?.endpoint}/tapplet.manifest.json`)
        const response = await fetch(`${state?.endpoint}/src/tapplet.config.json`)
        const config: TappletConfig = await response.json()
        if (config?.packageName === state?.package_name) {
          setIsVerified(true)
          if (config?.requiredPermissions) {
            dispatch(providerActions.updatePermissionsRequest({ permissions: config?.requiredPermissions }))
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
      fetchTappletManifest()
    }
  }, [])

  return <Box height="100%">{isVerified && <Tapplet source={state.endpoint} />}</Box>
}
