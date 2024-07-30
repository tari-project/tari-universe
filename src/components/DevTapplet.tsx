import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "@type/tapplet"
import { useEffect, useState } from "react"
import { Tapplet } from "./Tapplet"
import { useDispatch } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"

export function ActiveDevTapplet() {
  const { t } = useTranslation("errors")
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
              message: t("manifest-package-name-mismatch", {
                packageName: state?.package_name,
                manifestId: manifest?.id,
                endpoint: state?.endpoint,
              }),
            })
          )
        }
      } catch (error) {
        dispatch(
          errorActions.showError({
            message: t("fetching-taplet-manifest-failed", {
              error,
            }),
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
