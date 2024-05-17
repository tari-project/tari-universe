use axum::Router;
use std::{ net::SocketAddr, path::PathBuf };
use tokio::select;
use tokio_util::sync::CancellationToken;
use tower_http::services::ServeDir;

pub async fn start(tapplet_path: PathBuf) -> (String, CancellationToken) {
  serve(using_serve_dir(tapplet_path), 0).await
}

pub fn using_serve_dir(tapplet_path: PathBuf) -> Router {
  let serve_dir = ServeDir::new(tapplet_path);
  Router::new().nest_service("/", serve_dir)
}

pub async fn serve(app: Router, port: u16) -> (String, CancellationToken) {
  let cancel_token = CancellationToken::new();
  let cancel_token_clone = cancel_token.clone();
  let addr = SocketAddr::from(([127, 0, 0, 1], port));
  let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
  let address = listener.local_addr().unwrap().to_string();
  tauri::async_runtime::spawn(async move {
    axum::serve(listener, app).with_graceful_shutdown(shutdown_signal(cancel_token_clone)).await.unwrap()
  });
  return (address, cancel_token);
}

async fn shutdown_signal(cancel_token: CancellationToken) {
  select! {
        _ = cancel_token.cancelled() => {
            // The token was cancelled, task can shut down
            println!("Server shutting down");
        }
    }
}
