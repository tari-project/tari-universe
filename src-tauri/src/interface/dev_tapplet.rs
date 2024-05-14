use super::About;

#[derive(Debug, serde::Deserialize)]
pub struct DevTappletResponse {
  pub name: String,
  #[serde(rename = "displayName")]
  pub display_name: String,
  pub about: About,
}
