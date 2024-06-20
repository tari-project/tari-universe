import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "@type/tapplet"
import { useEffect, useRef, useState } from "react"
import { useSnackBar } from "../ErrorContext"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const tappletRef = useRef<HTMLIFrameElement | null>(null)
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

    setWidth(tappletRef?.current?.offsetWidth || 0)
    setHeight(tappletRef?.current?.offsetHeight || 0)

    const getSize = () => {
      if (tappletRef.current) {
        console.log("inside if")
        setWidth(tappletRef.current.offsetWidth)
        setHeight(tappletRef.current.offsetHeight)
      }
    }
    window.addEventListener("resize", getSize)

    if (state?.endpoint) {
      fetchTappletManifest()
    }

    return () => {
      window.removeEventListener("resize", getSize)
    }
  }, [])

  function onTappletLoad() {
    if (tappletRef.current) {
      console.log("inside if")
      setWidth(tappletRef.current.offsetWidth)
      setHeight(tappletRef.current.offsetHeight)
    }
  }

  return (
    <Box height="100%">
      {isVerified && (
        <iframe src={state.endpoint} width="100%" height="100%" ref={tappletRef} onLoad={onTappletLoad}></iframe>
      )}
    </Box>
  )
}
