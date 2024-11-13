import { useCallback, useEffect, useState } from "react"

import { Box, Button, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"
import SelectAccount from "./SelectAccount"
import { AccountInfo } from "@tari-project/typescript-bindings"

export const DEFAULT_ACCOUNT_NAME = "default"

export const Wallet: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const [balances, setBalances] = useState({})
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const [accountAddress, setAccountAddress] = useState("")
  const [accountsList, setAccountsList] = useState<AccountInfo[]>([])

  useEffect(() => {
    refreshAccount()
  }, [provider])

  const refreshAccount = useCallback(async () => {
    console.log("fetch")
    try {
      const { accounts } = await provider.getAccountsList() //TODO fix to get value not empty array
      setAccountsList(accounts)
      console.log(accountsList)
      const account = await provider.getAccount()
      console.log(account)
      setAccountAddress(account.address)
      const public_key = account.public_key
      setAccountsList([
        {
          account: {
            address: account.address as any,
            name: account.address,
            is_default: true,
            key_index: account.account_id,
          },
          public_key: public_key,
        },
      ])
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }, [provider])

  async function handleCreateAccount(accountName: string) {
    try {
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
      setAccountAddress(acc.address)
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
      console.log("get balances acc", accountAddress)
      // setBalances(await invoke("get_balances", {}))
      const resp = await provider.getAccountBalances(accountAddress)
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
        <SelectAccount onSubmit={handleCreateAccount} accountsList={accountsList} />
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
