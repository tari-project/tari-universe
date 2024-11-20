window.__TAURI_ISOLATION_HOOK__ = (payload) => {
  // TODO at the moment let's not verify or modify anything, just print the content from the hook

  return payload
}
