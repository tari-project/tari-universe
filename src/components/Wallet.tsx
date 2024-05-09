import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"

import { Typography } from "@mui/material"

export const Wallet: React.FC = () => {
  const [balances, setBalances] = useState({})

  async function get_free_coins() {
    await invoke("get_free_coins", {})
  }

  async function get_balances() {
    setBalances(await invoke("get_balances", {}))
  }

  return (
    <div className="container">
      <div style={{ marginTop: "24px" }}></div>
      <div style={{ marginTop: "24px" }}>
        <h1>Tauri wallet daemon</h1>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            get_free_coins()
          }}
        >
          <button type="submit">Get free coins</button>
        </form>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            get_balances()
          }}
        >
          <button type="submit">Get balances</button>
        </form>
        <Typography textAlign="center">balances: {JSON.stringify(balances)}</Typography>
      </div>
    </div>
  )
}
