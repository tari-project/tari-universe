import { transports } from "@tari-project/wallet_jrpc_client"
import { invoke } from "@tauri-apps/api/core"

export class IPCRpcTransport implements transports.RpcTransport {
  async sendRequest<T>(request: transports.RpcRequest, _: transports.RpcTransportOptions): Promise<T> {
    return await invoke("call_wallet", {
      method: request.method,
      params: JSON.stringify(request.params),
    })
  }

  async get_token(): Promise<string> {
    return await invoke("get_permission_token", {})
  }
}
