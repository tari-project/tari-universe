import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "@type/tapplet"
import { useEffect, useState } from "react"
import { Tapplet } from "./Tapplet"
import { useDispatch } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { ErrorSource } from "../store/error/error.types"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchTappletManifest = async () => {
      try {
        const response = await fetch(`${state?.endpoint}/tapplet.manifest.json`)
        const manifest = await response.json()
        if (manifest?.id === state?.package_name) {
          setIsVerified(true)
        } else {
          dispatch(
            errorActions.showError({
              message: `manifest-package-name-mismatch | packageName: ${state?.package_name} & manifestId: ${manifest?.id} & endpoint: ${state?.endpoint}`,
              errorSource: ErrorSource.FRONTEND,
            })
          )
        }
      } catch (error) {
        dispatch(
          errorActions.showError({
            message: `fetching-taplet-manifest-failed | error: ${error}`,
            errorSource: ErrorSource.FRONTEND,
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
