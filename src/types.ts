interface TauriEventPayload {
  event_type: "download_status"
  title: string
  title_params: Record<string, string>
  progress: number
  duration: number
}

export interface TauriEvent {
  event: string
  payload: TauriEventPayload
}
