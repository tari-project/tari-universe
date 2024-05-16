import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "@type/tapplet"
import { useEffect, useState } from "react"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [isVerified, setIsVerified] = useState<boolean>(false)

  useEffect(() => {
    const fetchTappletManifest = async () => {
      try {
        const response = await fetch(`${state?.endpoint}/tapplet.manifest.json`)
        const manifest = await response.json()
        if (manifest?.id === state?.package_name) {
          setIsVerified(true)
        } else {
          throw new Error(
            `Tapplet manifest does not match package name. Expected: ${state?.package_name} Received: ${manifest?.id} from: ${state?.endpoint}/tapplet.manifest.json`
          )
        }
      } catch (error) {
        console.error("Error fetching tapplet manifest:", error)
      }
    }

    if (state?.endpoint) {
      fetchTappletManifest()
    }
  }, [])

  return (
    <div>
      {isVerified && (
        <Box>
          <iframe src={state.endpoint} width="100%" height="500"></iframe>
        </Box>
      )}
    </div>
  )
}
