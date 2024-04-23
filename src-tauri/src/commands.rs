use tari_wallet_daemon_client::types::AccountsGetBalancesResponse;
use tauri::{self, State};

use crate::{
    rpc::{balances, free_coins, make_request, permission_token},
    tapplet_server::start,
    wallet_daemon::start_wallet_daemon,
    Tokens,
};

#[tauri::command]
pub async fn wallet_daemon() -> String {
    tauri::async_runtime::spawn(async move {
        let _ = start_wallet_daemon().await;
    });
    format!("Wallet daemon started")
}

#[tauri::command]
pub async fn get_permission_token(tokens: State<'_, Tokens>) -> Result<(), ()> {
    let handle = tauri::async_runtime::spawn(async move { permission_token().await.unwrap() });
    let (permission_token, auth_token) = handle.await.unwrap();
    tokens
        .permission
        .lock()
        .unwrap()
        .replace_range(.., &permission_token);
    tokens.auth.lock().unwrap().replace_range(.., &auth_token);
    Ok(())
}

#[tauri::command]
pub async fn get_free_coins(tokens: State<'_, Tokens>) -> Result<(), ()> {
    let permission_token = tokens.permission.lock().unwrap().clone();
    let auth_token = tokens.auth.lock().unwrap().clone();
    let handle = tauri::async_runtime::spawn(async move {
        free_coins(auth_token, permission_token).await.unwrap()
    });
    handle.await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn get_balances(tokens: State<'_, Tokens>) -> Result<AccountsGetBalancesResponse, ()> {
    let permission_token = tokens.permission.lock().unwrap().clone();
    let auth_token = tokens.auth.lock().unwrap().clone();
    let handle = tauri::async_runtime::spawn(async move {
        balances(auth_token, permission_token).await.unwrap()
    });
    let balances = handle.await.unwrap();

    Ok(balances)
}

#[tauri::command]
pub async fn launch_tapplet(tokens: State<'_, Tokens>) -> Result<String, ()> {
    let tapplet_handle = tauri::async_runtime::spawn(async move { start().await });
    let (addr, cancel_token) = tapplet_handle.await.unwrap();
    let mut state = tokens.cancel_token.lock().unwrap();
    *state = cancel_token;
    Ok(addr)
}

#[tauri::command]
pub async fn close_tapplet(tokens: State<'_, Tokens>) -> Result<(), ()> {
    tokens.cancel_token.lock().unwrap().cancel();
    Ok(())
}

#[tauri::command]
pub async fn call_wallet(
    method: String,
    params: String,
    tokens: State<'_, Tokens>,
) -> Result<serde_json::Value, ()> {
    let permission_token = tokens.permission.lock().unwrap().clone();
    let req_params: serde_json::Value = serde_json::from_str(&params).unwrap();
    let handle = tauri::async_runtime::spawn(async move {
        make_request(Some(permission_token), method, req_params)
            .await
            .unwrap()
    });
    let response = handle.await.unwrap();
    Ok(response)
}
