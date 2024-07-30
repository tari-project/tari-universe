import { Box, Typography } from "@mui/material"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Tapplet } from "./Tapplet"
import { useDispatch } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"

export function ActiveTapplet() {
  const { t } = useTranslation("components")
  const [tappletAddress, setTappletAddress] = useState("")
  const { id } = useParams()
  const installedTappletId = Number(id)
  const dispatch = useDispatch()

  useEffect(() => {
    invoke("launch_tapplet", { installedTappletId })
      .then((res: unknown) => {
        setTappletAddress(res as string)
      })
      .catch((error) => dispatch(errorActions.showError({ message: error as string })))

    return () => {
      invoke("close_tapplet", { installedTappletId }).catch((error) =>
        dispatch(errorActions.showError({ message: error as string }))
      )
      setTappletAddress("")
    }
  }, [])

  return (
    <Box height="100%">
      {tappletAddress ? <Tapplet source={tappletAddress} /> : <Typography>{t("taplet-obtain-failure")}</Typography>}
    </Box>
  )
}
