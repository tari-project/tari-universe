use axum::Router;
use std::net::SocketAddr;
use tokio::select;
use tokio_util::sync::CancellationToken;
use tower_http::services::ServeDir;
use crate::error::Error;

const TAPPLET_DIR: &str = "../tapplets_installed"; // TODO store in config

pub async fn start(tapplet_path: &str) -> Result<(String, CancellationToken), Error> {
  serve(using_serve_dir(tapplet_path), 0).await
}

pub fn using_serve_dir(tapplet_path: &str) -> Router {
  let serve_dir = ServeDir::new(format!("{}/{}", TAPPLET_DIR, tapplet_path));
  Router::new().nest_service("/", serve_dir)
}

pub async fn serve(app: Router, port: u16) -> Result<(String, CancellationToken), Error> {
  let cancel_token = CancellationToken::new();
  let cancel_token_clone = cancel_token.clone();

  let addr = SocketAddr::from(([127, 0, 0, 1], port));
  let listener = tokio::net::TcpListener
    ::bind(addr).await
    .map_err(|_| Error::BindPortError { port: addr.to_string() })?;
  let address = listener
    .local_addr()
    .map_err(|_| Error::LocalAddressError())?
    .to_string();

  tauri::async_runtime::spawn(async move { axum
      ::serve(listener, app)
      .with_graceful_shutdown(shutdown_signal(cancel_token_clone)).await
      .map_err(|_| Error::TappletServerError()) });
  Ok((address, cancel_token))
}

async fn shutdown_signal(cancel_token: CancellationToken) {
  select! {
        _ = cancel_token.cancelled() => {
            // The token was cancelled, task can shut down
            println!("Server shutting down");
        }
    }
}
