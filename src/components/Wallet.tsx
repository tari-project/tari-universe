import { useCallback, useEffect, useState } from "react"

import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { errorActions } from "../store/error/error.slice"
import { useTranslation } from "react-i18next"
import { ErrorSource } from "../store/error/error.types"
import { providerSelector } from "../store/provider/provider.selector"
import SelectAccount from "./SelectAccount"
import { AccountInfo, substateIdToString } from "@tari-project/typescript-bindings"
import { accountActions } from "../store/account/account.slice"
import { accountSelector } from "../store/account/account.selector"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"

export const Wallet: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const [balances, setBalances] = useState({})
  const dispatch = useDispatch()
  const provider = useSelector(providerSelector.selectProvider)
  const currentAccount = useSelector(accountSelector.selectAccount)
  const [accountsList, setAccountsList] = useState<AccountInfo[]>([])

  useEffect(() => {
    refreshAccount()
  }, [provider, currentAccount])

  const refreshAccount = useCallback(async () => {
    try {
      const { accounts } = await provider.getAccountsList()
      setAccountsList(accounts)
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }, [provider])

  async function handleCreateAccount(accountName: string) {
    try {
      await provider.createFreeTestCoins(accountName)
      dispatch(
        accountActions.setAccountRequest({
          accountName,
        })
      )
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  async function get_free_coins() {
    try {
      const currentAccountName = currentAccount?.account.name ?? undefined
      await provider.createFreeTestCoins(currentAccountName)
    } catch (error) {
      console.error(error)
      if (typeof error === "string") {
        dispatch(errorActions.showError({ message: error, errorSource: ErrorSource.BACKEND }))
      }
    }
  }

  async function get_balances() {
    try {
      const accountAddress = substateIdToString(currentAccount?.account.address ?? null)
      const resp = await provider.getAccountBalances(accountAddress)
      setBalances(resp.balances)
    } catch (error) {
      console.error(error)
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
        <SelectAccount
          onSubmit={handleCreateAccount}
          accountsList={accountsList}
          currentAccount={currentAccount ?? undefined}
        />
        <Paper variant="outlined" elevation={0} sx={{ padding: 1, borderRadius: 2, width: "auto", minWidth: 200 }}>
          <Stack direction="column" justifyContent="flex-end">
            <Typography variant="caption" textAlign="left">{`Name: ${currentAccount?.account.name}`}</Typography>
            <Typography variant="caption" textAlign="left">{`${t("address", {
              ns: "common",
            })}: ${substateIdToString(currentAccount?.account.address ?? null)}`}</Typography>
          </Stack>
        </Paper>
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
