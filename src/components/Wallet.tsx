import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"

import { Box, Button, Typography } from "@mui/material"
import { useSnackBar } from "../ErrorContext"

export const Wallet: React.FC = () => {
  const [balances, setBalances] = useState({})
  const { showSnackBar } = useSnackBar()

  async function get_free_coins() {
    try {
      await invoke("get_free_coins", {})
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  async function get_balances() {
    try {
      setBalances(await invoke("get_balances", {}))
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  return (
    <Box mt={4}>
      <Typography variant="h4" textAlign="center" pt={6}>
        Tauri wallet daemon
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} alignItems="center" py={4}>
        <Button onClick={get_free_coins} variant="contained" sx={{ width: 200 }}>
          Get free coins
        </Button>
        <Button onClick={get_balances} variant="contained" sx={{ width: 200 }}>
          Get balances
        </Button>
      </Box>
      <Typography textAlign="center">balances: {JSON.stringify(balances)}</Typography>
    </Box>
  )
}
