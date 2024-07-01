import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "@type/tapplet"
import { useEffect, useState } from "react"
import { useSnackBar } from "../ErrorContext"
import { Tapplet } from "./Tapplet"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    const fetchTappletManifest = async () => {
      try {
        const response = await fetch(`${state?.endpoint}/tapplet.manifest.json`)
        const manifest = await response.json()
        if (manifest?.id === state?.package_name) {
          setIsVerified(true)
        } else {
          showSnackBar(
            `Tapplet manifest does not match package name. Expected: ${state?.package_name} Received: ${manifest?.id} from: ${state?.endpoint}/tapplet.manifest.json`,
            "error"
          )
        }
      } catch (error) {
        showSnackBar(`Error fetching tapplet manifest: ${error}`, "error")
      }
    }

    if (state?.endpoint) {
      fetchTappletManifest()
    }
  }, [])

  return <Box height="100%">{isVerified && <Tapplet source={state.endpoint} />}</Box>
}
