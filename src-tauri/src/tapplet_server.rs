use axum::Router;
use std::{ net::SocketAddr, path::PathBuf };
use tokio::select;
use tokio_util::sync::CancellationToken;
use tower_http::services::ServeDir;
use crate::error::{ Error::{ self, TappletServerError }, TappletServerError::* };

pub async fn start(tapplet_path: PathBuf) -> Result<(String, CancellationToken), Error> {
  serve(using_serve_dir(tapplet_path), 0).await
}

pub fn using_serve_dir(tapplet_path: PathBuf) -> Router {
  let serve_dir = ServeDir::new(tapplet_path);
  Router::new().nest_service("/", serve_dir)
}

pub async fn serve(app: Router, port: u16) -> Result<(String, CancellationToken), Error> {
  let cancel_token = CancellationToken::new();
  let cancel_token_clone = cancel_token.clone();

  let addr = SocketAddr::from(([127, 0, 0, 1], port));
  let listener = tokio::net::TcpListener
    ::bind(addr).await
    .map_err(|_| TappletServerError(BindPortError { port: addr.to_string() }))?;
  let address = listener
    .local_addr()
    .map_err(|_| TappletServerError(FailedToObtainLocalAddress()))?
    .to_string();

  tauri::async_runtime::spawn(async move { axum
      ::serve(listener, app)
      .with_graceful_shutdown(shutdown_signal(cancel_token_clone)).await
      .map_err(|_| TappletServerError(FailedToStart())) });
  Ok((address, cancel_token))
}

async fn shutdown_signal(cancel_token: CancellationToken) {
  select! {
        _ = cancel_token.cancelled() => {}
    }
}
