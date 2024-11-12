import { useCallback, useEffect, useState } from "react"

import { Button, Stack, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"

export const Account: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const [account, setAccount] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    refreshAccount()
    // handleAuthenticated()
  }, [provider])

  const getAccount = useCallback(async () => {
    const account = await provider.getAccount()
    console.log("ACCOUNT", account)
    if (!account) throw new Error("Account not initialized")
    return account
  }, [provider])

  const refreshAccount = useCallback(async () => {
    console.log("fetch")
    try {
      const acc = await getAccount()
      setAccount(acc.address)
      setIsConnected(provider.isConnected())
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }, [provider])

  const fetchAccount = async () => {
    refreshAccount()
  }

  return (
    <>
      <Stack direction="column" justifyContent="flex-end">
        <Button sx={{ alignSelf: "center" }} onClick={fetchAccount}>
          {t("refresh")}
        </Button>
        <Typography variant="caption" textAlign="left">{`Provider connected: ${isConnected}`}</Typography>
        <Typography variant="caption" textAlign="left">{`${t("address", { ns: "common" })}: ${account}`}</Typography>
      </Stack>
    </>
  )
}
