import { Box, Typography } from "@mui/material"
import { BalanceUpdate } from "../store/simulation/simulation.types"

export const BalanceUpdateView = (balanceUpdate: BalanceUpdate) => {
  const { tokenSymbol, newBalance, currentBalance } = balanceUpdate
  const balanceChange = newBalance - currentBalance
  const isPositive = balanceChange >= 0
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Typography>{tokenSymbol}:</Typography>
      <Typography color={isPositive ? "green" : "red"}>
        {isPositive && "+"}
        {balanceChange}
      </Typography>
    </Box>
  )
}
