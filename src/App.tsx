import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";

function App() {
  const [balances, setBalances] = useState({});
  async function start_wallet_daemon() {
    console.log(await invoke("wallet_daemon", {}), "start wallet daemon");
  }

  async function get_permission_token() {
    console.log(await invoke("get_permission_token", {}), "auth token");
  }

  async function get_free_coins() {
    console.log(await invoke("get_free_coins", {}), "free coins");
  }

  async function get_balances() {
    setBalances(await invoke("get_balances", {}));
  }

  return (
    <div className="container">
      <h1>Tauri wallet daemon</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          start_wallet_daemon();
        }}
      >
        <button type="submit">Start wallet daemon</button>
      </form>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          get_permission_token();
        }}
      >
        <button type="submit">Get permission token</button>
      </form>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          get_free_coins();
        }}
      >
        <button type="submit">Get free coins</button>
      </form>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          get_balances();
        }}
      >
        <button type="submit">Get balances</button>
      </form>
      balances: {JSON.stringify(balances)}
    </div>
  );
}

export default App;
