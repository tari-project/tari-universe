export type WalletBalances = {
  address: {
    Component: string
  }
  balances: []
}
export type Balance = {
  balance: number
  confidential_balance: number
  resource_address: string
  resource_type: string
  token_symbol: string
  vault_address: {
    Vault: string
  }
}
