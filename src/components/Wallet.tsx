import { useCallback, useEffect, useState } from "react"

import { Box, Button, SelectChangeEvent, TextField, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"
import SelectAccount from "./SelectAccount"
import { AccountInfo } from "@tari-project/typescript-bindings"
import { accountActions } from "../store/account/account.slice"
import { accountSelector } from "../store/account/account.selector"

export const DEFAULT_ACCOUNT_NAME = "default"

export const Wallet: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const [balances, setBalances] = useState({})
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const currentAccount = useSelector(accountSelector.selectAccount)
  // const [accountAddress, setAccountAddress] = useState("")
  const [accountsList, setAccountsList] = useState<AccountInfo[]>([])

  useEffect(() => {
    refreshAccount()
  }, [provider])

  const refreshAccount = useCallback(async () => {
    console.log("fetch")
    try {
      const { accounts, total } = await provider.getAccountsList() //TODO fix to get value not empty array
      setAccountsList(accounts)
      console.log(accountsList)
      // const account = await provider.selectAccount()
      // console.log("get account list:", accounts, total)
      // setAccountAddress(account.address)
      // const public_key = account.public_key
      // dispatch(
      //   accountActions.changeCurrentAccount({
      //     account: {
      //       account: {
      //         name: account.address,
      //         address: account.address as any,
      //         key_index: account.account_id,
      //         is_default: true,
      //       },
      //       public_key: account.public_key,
      //     },
      //   })
      // )
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }, [provider])

  async function handleCreateAccount(accountName: string) {
    try {
      const account = await provider.createFreeTestCoins(accountName)
      console.log("HANDLE CREATE ACCOUNT", account)
      dispatch(
        accountActions.changeCurrentAccount({
          account: {
            account: {
              name: accountName,
              address: account.address as any,
              key_index: account.account_id,
              is_default: true,
            },
            public_key: account.public_key,
          },
        })
      )
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
      const name = DEFAULT_ACCOUNT_NAME
      if (!currentAccount) return
      const currentAccountName = currentAccount?.account.name ?? undefined
      console.log(currentAccountName)
      const account = await provider.createFreeTestCoins(currentAccountName)
      // setAccountAddress(acc.address)
      // dispatch(
      //   accountActions.changeCurrentAccount({
      //     account: {
      //       account: {
      //         name: account.address,
      //         address: account.address as any,
      //         key_index: account.account_id,
      //         is_default: true,
      //       },
      //       public_key: account.public_key,
      //     },
      //   })
      // )
      // console.log("GET ACCOUNT", acc)
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
      // const addr = (currentAccount && currentAccount.account.address as { Component: string }).Component,
      const addr = currentAccount?.account.address as any

      console.log("get balances acc store", currentAccount)
      console.log("get balances acc store", currentAccount?.account.address)
      console.log("get balances acc store addr", addr)
      // setBalances(await invoke("get_balances", {}))
      const resp = await provider.getAccountBalances(addr)
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
