import { Box, Typography } from "@mui/material"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Tapplet } from "./Tapplet"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { LaunchedTappResult } from "@type/tapplet"
import { tappletProvidersActions } from "../store/tappletProviders/tappletProviders.slice"
import { RootState } from "../store/store"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"

const selectTappProviderById = (state: RootState, id?: number) =>
  id ? tappletProviderSelector.getTappletProviderById(state, id) : null

export function ActiveTapplet() {
  const { t } = useTranslation("components")
  const { id } = useParams()
  const dispatch = useDispatch()
  const [tappletAddress, setTappletAddress] = useState("")
  const installedTappletId = Number(id)
  const tappProvider = useSelector((state: RootState) => selectTappProviderById(state, Number(id)))

  useEffect(() => {
    invoke("launch_tapplet", { installedTappletId })
      .then((res: any) => {
        const launchedTappParams: LaunchedTappResult = res
        setTappletAddress(launchedTappParams.endpoint)
        if (launchedTappParams.permissions) {
          if (id != tappProvider?.id) {
            console.log("DEV TAPP dispatch")
            dispatch(
              tappletProvidersActions.addTappProviderReq({
                installedTappletId: Number(id),
                launchedTappParams: {
                  endpoint: launchedTappParams.endpoint,
                  permissions: launchedTappParams.permissions,
                },
              })
            )
          } else {
            // not sure if we should update it every time but I dont think so
            // TODO check if update needed
            dispatch(
              tappletProvidersActions.updateTappProviderRequest({
                tappletId: Number(id),
                permissions: launchedTappParams.permissions,
              })
            )
          }
        } else {
          dispatch(
            errorActions.showError({
              message: `failed-to-fetch-tapp-config | error-${"Tapplet permissions undefined"}`,
              errorSource: ErrorSource.BACKEND,
            })
          )
        }
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
      {tappletAddress && tappProvider ? (
        <Tapplet source={tappletAddress} provider={tappProvider.provider} />
      ) : (
        <Typography>{t("taplet-obtain-failure")}</Typography>
      )}
    </Box>
  )
}
