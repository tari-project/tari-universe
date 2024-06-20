import { Box, Typography } from "@mui/material"
import { invoke } from "@tauri-apps/api/core"
import { createRef, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSnackBar } from "../ErrorContext"

export function ActiveTapplet() {
  const [tappletAddress, setTappletAddress] = useState("")
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const tappletRef = createRef<HTMLIFrameElement>()
  const { id } = useParams()
  const installedTappletId = Number(id)
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    invoke("launch_tapplet", { installedTappletId })
      .then((res: unknown) => {
        setTappletAddress(res as string)
      })
      .catch((error) => showSnackBar(error, "error"))

    setWidth(tappletRef?.current?.offsetWidth || 0)
    setHeight(tappletRef?.current?.offsetHeight || 0)

    const getSize = () => {
      if (tappletRef.current) {
        setWidth(tappletRef.current.offsetWidth)
        setHeight(tappletRef.current.offsetHeight)
      }
    }
    window.addEventListener("resize", getSize)

    return () => {
      invoke("close_tapplet", { installedTappletId }).catch((error) => showSnackBar(error, "error"))
      setTappletAddress("")
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
    <Box>
      {tappletAddress ? (
        <iframe src={tappletAddress} width="100%" height="500" ref={tappletRef} onLoad={onTappletLoad}></iframe>
      ) : (
        <Typography>Failed to obtain tapplet endpoint</Typography>
      )}
      <Box>
        width: {width}, height: {height}
      </Box>
    </Box>
  )
}
