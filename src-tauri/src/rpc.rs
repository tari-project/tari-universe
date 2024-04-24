use axum_jrpc::{JsonRpcAnswer, JsonRpcRequest, JsonRpcResponse};
use serde::Serialize;
use std::{env, net::SocketAddr};
use tari_wallet_daemon_client::{
    types::{
        AccountsCreateFreeTestCoinsRequest, AccountsGetBalancesRequest,
        AccountsGetBalancesResponse, AuthLoginAcceptRequest, AuthLoginAcceptResponse,
        AuthLoginRequest, AuthLoginResponse,
    },
    ComponentAddressOrName,
};
use tauri_plugin_http::reqwest::{
    self,
    header::{AUTHORIZATION, CONTENT_TYPE},
};

pub async fn permission_token() -> Result<(String, String), anyhow::Error> {
    let req_params = AuthLoginRequest {
        permissions: vec!["Admin".to_string()],
        duration: None,
    };
    let req_res = make_request(None, "auth.request".to_string(), &req_params).await?;
    let req_res: AuthLoginResponse = serde_json::from_value(req_res)?;

    let auth_token = req_res.auth_token;

    let acc_params = AuthLoginAcceptRequest {
        auth_token: auth_token.clone(),
        name: auth_token.clone(),
    };
    let acc_res = make_request(None, "auth.accept".to_string(), &acc_params).await?;
    let acc_res: AuthLoginAcceptResponse = serde_json::from_value(acc_res)?;

    Ok((acc_res.permissions_token, auth_token))
}

pub async fn free_coins(
    auth_token: String,
    permissions_token: String,
) -> Result<(), anyhow::Error> {
    let free_coins_params = AccountsCreateFreeTestCoinsRequest {
        account: Some(ComponentAddressOrName::Name(auth_token)),
        amount: 100_000_000.into(),
        max_fee: None,
        key_id: None,
    };
    make_request(
        Some(permissions_token),
        "accounts.create_free_test_coins".to_string(),
        free_coins_params,
    )
    .await?;

    Ok(())
}

pub async fn balances(
    auth_token: String,
    permissions_token: String,
) -> Result<AccountsGetBalancesResponse, anyhow::Error> {
    let balance_req = AccountsGetBalancesRequest {
        account: Some(ComponentAddressOrName::Name(auth_token)),
        refresh: false,
    };
    let balance_res = make_request(
        Some(permissions_token),
        "accounts.get_balances".to_string(),
        balance_req,
    )
    .await?;
    let balance_res: AccountsGetBalancesResponse = serde_json::from_value(balance_res)?;

    Ok(balance_res)
}

pub async fn make_request<T: Serialize>(
    token: Option<String>,
    method: String,
    params: T,
) -> Result<serde_json::Value, anyhow::Error> {
    let address: SocketAddr = env::var("JSON_CONNECT_ADDRESS").unwrap().parse().unwrap();
    let url = format!("http://{}", address);
    let client = reqwest::Client::new();
    let body = JsonRpcRequest {
        id: 0,
        jsonrpc: "2.0".to_string(),
        method,
        params: serde_json::to_value(params)?,
    };
    let mut builder = client.post(url).header(CONTENT_TYPE, "application/json");
    if let Some(token) = token {
        builder = builder.header(AUTHORIZATION, format!("Bearer {token}"));
    }
    let resp = builder
        .json(&body)
        .send()
        .await?
        .json::<JsonRpcResponse>()
        .await?;
    match resp.result {
        JsonRpcAnswer::Result(result) => Ok(result),
        JsonRpcAnswer::Error(error) => Err(anyhow::Error::msg(error.to_string())),
    }
}
