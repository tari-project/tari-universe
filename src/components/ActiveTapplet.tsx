import { Box } from "@mui/material"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export function ActiveTapplet() {
  const [tappletAddress, setTappletAddress] = useState("")
  const { id } = useParams()
  const installedTappletId = Number(id)

  useEffect(() => {
    invoke("launch_tapplet", { installedTappletId })
      .then((res: unknown) => {
        setTappletAddress(res as string)
      })
      .catch((err: unknown) => {
        console.log("error", err)
      })
    return () => {
      invoke("close_tapplet", { installedTappletId })
      setTappletAddress("")
    }
  }, [])

  return (
    <div>
      {tappletAddress && (
        <Box>
          <iframe src={tappletAddress} width="100%" height="500"></iframe>
        </Box>
      )}
    </div>
  )
}
