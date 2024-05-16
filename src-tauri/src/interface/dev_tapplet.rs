#[derive(Debug, serde::Deserialize)]
pub struct DevTappletResponse {
  pub name: String,
  pub id: String,
  #[serde(rename = "displayName")]
  pub display_name: String,
}
