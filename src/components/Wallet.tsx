import { useCallback, useEffect, useState } from "react"

import { Box, Button, TextField, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"

export const DEFAULT_ACCOUNT_NAME = "default"

export const Wallet: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const [balances, setBalances] = useState({})
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const [account, setAccount] = useState("")
  const [accountName, setAccountName] = useState("")

  useEffect(() => {
    refreshAccount()
  }, [provider])

  const refreshAccount = useCallback(async () => {
    console.log("fetch")
    try {
      const account = await provider.getAccount()
      setAccount(account.address)
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }, [provider])

  async function create_account() {
    try {
      console.log("provider authenticated")
      const acc = await provider.createAccount(accountName)
      console.log("GET ACCOUNT", acc)
    } catch (error) {
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  async function get_free_coins() {
    try {
      console.log("==================================================")
      // needs to have account name - otherwise it throws error
      const acc = await provider.createFreeTestCoins(DEFAULT_ACCOUNT_NAME)
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value)
  }

  return (
    <Box mt={4}>
      <Typography variant="h4" textAlign="center" pt={6}>
        {t("tari-wallet-daemon", { ns: "components" })}
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} alignItems="center" py={4}>
        <Box display="flex" flexDirection="row" gap={2} alignItems="center" py={4}>
          <TextField
            name="accountName"
            label="Account Name"
            value={accountName}
            onChange={onChange}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={create_account} variant="contained" sx={{ width: 200 }}>
            {t("create-account", { ns: "components" })}
          </Button>
        </Box>
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
