import { useState } from "react"

import { Box, Button, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"

export const Wallet: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const [balances, setBalances] = useState({})
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const [account, setAccount] = useState("")

  async function create_account() {
    try {
      // await invoke("create_account", {})
      // const cli = await provider.getClient()
      // await provider.authenticateClient(cli)
      console.log("provider authenticated")
      const acc = await provider.createAccount("batat")
      console.log("GET ACCOUNT", acc)
    } catch (error) {
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  async function get_free_coins() {
    try {
      // await invoke("get_free_coins", {})
      console.log("==================================================")
      // const cli = await provider.getClient()
      // await provider.authenticateClient(cli)
      console.log("provider authenticated")
      const acc = await provider.createFreeTestCoins("banan")
      setAccount(acc.address)
      console.log("GET ACCOUNT", acc)
    } catch (error) {
      console.log("GET ACCOUNT ERROR", error)
      if (typeof error === "string") {
        console.log(error)
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  async function get_balances() {
    try {
      console.log("==================================================")
      console.log("get balances acc", account)
      // setBalances(await invoke("get_balances", {}))
      const resp = await provider.getAccountBalances(account)
      console.log("get balances resp", resp)
      setBalances(resp.balances)
    } catch (error) {
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  return (
    <Box mt={4}>
      <Typography variant="h4" textAlign="center" pt={6}>
        {t("tari-wallet-daemon", { ns: "components" })}
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} alignItems="center" py={4}>
        <Button onClick={create_account} variant="contained" sx={{ width: 200 }}>
          {t("create-account", { ns: "components" })}
        </Button>
        <Button onClick={get_free_coins} variant="contained" sx={{ width: 200 }}>
          {t("get-free-coins", { ns: "components" })}
        </Button>
        <Button onClick={get_balances} variant="contained" sx={{ width: 200 }}>
          {t("get-balances", { ns: "components" })}
        </Button>
      </Box>
      <Typography textAlign="center">{`${t("balances", { ns: "common" })}:${JSON.stringify(balances)}`}</Typography>
    </Box>
  )
}
