import { Box, Typography } from "@mui/material"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Tapplet } from "./Tapplet"
import { useDispatch } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"

export function ActiveTapplet() {
  const { t } = useTranslation("components")
  const [tappletAddress, setTappletAddress] = useState("")
  const { id } = useParams()
  const installedTappletId = Number(id)
  const dispatch = useDispatch()

  useEffect(() => {
    // TODO tu wyciagam permissiony
    invoke("launch_tapplet", { installedTappletId })
      .then((res: unknown) => {
        // setTappletAddress(res as string)
        console.log("============")
        console.log("LAUNCH TAPPLET RESPONSE", res)
      })
      .catch((error: string) => dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND })))

    return () => {
      invoke("close_tapplet", { installedTappletId }).catch((error: string) =>
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
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
