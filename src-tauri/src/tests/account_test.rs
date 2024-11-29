#[cfg(test)]
mod tests {
  use tokio::time::{ self, Duration };

  use crate::rpc::{ balances, free_coins, permission_token };

  #[tokio::test]
  async fn get_account_balance() {
    let timeout_duration = Duration::from_secs(30);
    let (permission_token, _auth_token) = permission_token().await.unwrap();
    let account_name = "default".to_string();
    let get_tokens_result = time::timeout(
      timeout_duration,
      free_coins(Some(account_name.clone()), permission_token.clone())
    ).await;

    match get_tokens_result {
      Ok(Ok(value)) => {
        let resp = value.as_str().unwrap_or("").to_string();
        assert_eq!(resp, "default");
      }
      Ok(Err(e)) => panic!("Function returned an error: {}", e),
      Err(_) => panic!("Function 'free_coins' timed out!"),
    }

    let get_balance_result = time::timeout(timeout_duration, balances(Some(account_name), permission_token)).await;

    match get_balance_result {
      Ok(Ok(res)) => {
        let address = res.address.is_component();
        assert_eq!(address, true);
      }
      Ok(Err(e)) => panic!("Function returned an error: {}", e),
      Err(_) => panic!("Function 'balances' timed out!"),
    }
  }
}
