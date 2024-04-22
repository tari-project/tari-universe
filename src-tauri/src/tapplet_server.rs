use axum::Router;
use std::net::SocketAddr;
use tower_http::{services::ServeDir, trace::TraceLayer};
pub async fn start() {
    tokio::join!(serve(using_serve_dir(), 3001),);
}

pub fn using_serve_dir() -> Router {
    let serve_dir = ServeDir::new("../tapplets/tapplet-example");
    Router::new().nest_service("/", serve_dir)
}

pub async fn serve(app: Router, port: u16) {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.layer(TraceLayer::new_for_http()))
        .await
        .unwrap();
}
