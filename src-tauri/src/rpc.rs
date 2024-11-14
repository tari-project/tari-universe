use axum_jrpc::{ JsonRpcAnswer, JsonRpcRequest, JsonRpcResponse };
use serde::Serialize;
use std::{ net::SocketAddr, str::FromStr };
use tari_wallet_daemon_client::{
  types::{
    AccountsCreateFreeTestCoinsRequest,
    AccountsCreateRequest,
    AccountsGetBalancesRequest,
    AccountsGetBalancesResponse,
    AuthLoginAcceptRequest,
    AuthLoginAcceptResponse,
    AuthLoginRequest,
    AuthLoginResponse,
  },
  ComponentAddressOrName,
};
use tauri_plugin_http::reqwest::{ self, header::{ AUTHORIZATION, CONTENT_TYPE } };

use crate::error::Error;

const JSON_CONNECT_ADDRESS: &str = "127.0.0.1:18010"; // TODO use db to get endpoint

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

pub async fn account_create(account_name: Option<String>, permissions_token: String) -> Result<(), anyhow::Error> {
  let create_acc_params = AccountsCreateRequest {
    account_name: Some("User".to_string()),
    custom_access_rules: None,
    is_default: false,
    key_id: None,
    max_fee: None,
  };
  println!("----------- REQEST {:?}", create_acc_params);
  let resp = make_request(Some(permissions_token), "accounts.create".to_string(), create_acc_params).await?;
  println!("----------- REQEST resp {:?}", resp);

  Ok(())
}

pub async fn free_coins(account_name: Option<String>, permissions_token: String) -> Result<(), anyhow::Error> {
  let free_coins_params = AccountsCreateFreeTestCoinsRequest {
    account: account_name.map(|acc_name| ComponentAddressOrName::Name(acc_name)),
    amount: (100_000_000).into(),
    max_fee: None,
    key_id: None,
  };
  println!("----------- REQEST free test coins {:?}", free_coins_params);
  let resp = make_request(
    Some(permissions_token),
    "accounts.create_free_test_coins".to_string(),
    free_coins_params
  ).await?;
  println!("----------- REQEST resp {:?}", resp);
  Ok(())
}

pub async fn balances(
  account_name: Option<String>,
  permissions_token: String
) -> Result<AccountsGetBalancesResponse, Error> {
  let balance_req = AccountsGetBalancesRequest {
    account: account_name.map(|acc_name| ComponentAddressOrName::Name(acc_name)),
    refresh: false,
  };
  let method = "accounts.get_balances".to_string();
  let serialized_params = serde_json::to_string(&balance_req).map_err(|e| Error::JsonParsingError(e))?;
  let balance_res = make_request(Some(permissions_token), method.clone(), balance_req).await.map_err(
    |_| Error::ProviderError {
      method,
      params: serialized_params,
    }
  )?;
  let balance_res: AccountsGetBalancesResponse = serde_json::from_value(balance_res)?;

  Ok(balance_res)
}

pub async fn make_request<T: Serialize>(
  token: Option<String>,
  method: String,
  params: T
) -> Result<serde_json::Value, anyhow::Error> {
  let address = SocketAddr::from_str(JSON_CONNECT_ADDRESS).unwrap();
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
  println!("------- JSON REQ BODY ");
  println!("{:?}", &body);
  let resp = builder.json(&body).send().await?.json::<JsonRpcResponse>().await?;
  println!("------- JSON RESPONSE {:?} ", resp.result);
  match resp.result {
    JsonRpcAnswer::Result(result) => Ok(result),
    JsonRpcAnswer::Error(error) => Err(anyhow::Error::msg(error.to_string())),
  }
}
