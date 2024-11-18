window.__TAURI_ISOLATION_HOOK__ = (payload) => {
  // at the moment let's not verify or modify anything, just print the content from the hook
  if (payload !== null) {
    console.log("isolation hook", payload)
  }
  return payload
}
