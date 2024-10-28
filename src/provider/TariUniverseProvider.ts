import {
  WalletDaemonClient,
  stringToSubstateId,
  Instruction,
  SubstateType,
  substateIdToString,
  KeyBranch,
  TransactionSubmitRequest,
  AccountsGetBalancesResponse,
} from "@tari-project/wallet_jrpc_client"
import {
  Account,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  Substate,
  TariPermissions,
  TariProvider,
  TemplateDefinition,
  TransactionResult,
  TransactionStatus,
  VaultBalances,
} from "@tari-project/tarijs"
import { ListSubstatesResponse } from "@tari-project/tarijs/dist/providers"
import { accountsCreate, accountsCreateFreeTestCoins, client, setClientInstance } from "./json_rpc"
import { TUProviderMethod } from "../store/transaction/transaction.types"

export type WalletDaemonParameters = {
  permissions: TariPermissions
  optionalPermissions: TariPermissions
  name?: string
  onConnection?: () => void
}

export type WindowSize = {
  width: number
  height: number
}
// let clientInstance: WalletDaemonClient | null = null
// let pendingClientInstance: Promise<WalletDaemonClient> | null = null
// let outerAddress: URL | null = null
const DEFAULT_WALLET_ADDRESS = new URL(
  import.meta.env.VITE_DAEMON_JRPC_ADDRESS ||
    import.meta.env.VITE_JSON_RPC_ADDRESS ||
    import.meta.env.VITE_JRPC_ADDRESS ||
    "http://127.0.0.1:18010/"
)
export async function getClientAddress(): Promise<URL> {
  try {
    let resp = await fetch("/json_rpc_address")
    if (resp.status === 200) {
      return new URL(await resp.text())
    }
  } catch (e) {
    console.warn(e)
  }

  return DEFAULT_WALLET_ADDRESS
}

export class TariUniverseProvider implements TariProvider {
  public providerName = "TariUniverseProvider"
  params: WalletDaemonParameters
  client: WalletDaemonClient

  private constructor(
    params: WalletDaemonParameters,
    connection: WalletDaemonClient,
    public width = 0,
    public height = 0
  ) {
    this.params = params
    this.client = connection
  }

  public isConnected(): boolean {
    return true
  }

  public async getClient(): Promise<WalletDaemonClient> {
    // const getAddress = Promise.resolve(getClientAddress())
    // const client = getAddress.then(async (addr) => {
    //   const client = WalletDaemonClient.usingFetchTransport(addr.toString())
    //   await this.authenticateClient(client)
    //   outerAddress = addr
    //   clientInstance = client
    //   pendingClientInstance = null
    //   return client
    // })
    // return client
    return this.client
  }

  public async authenticateClient(client: WalletDaemonClient) {
    const auth_token = await client.authRequest(["Admin"])
    await client.authAccept(auth_token, auth_token)
  }

  static build(params: WalletDaemonParameters): TariUniverseProvider {
    const allPermissions = new TariPermissions()
    allPermissions.addPermissions(params.permissions)
    allPermissions.addPermissions(params.optionalPermissions)
    const walletDaemonClient = WalletDaemonClient.usingFetchTransport(DEFAULT_WALLET_ADDRESS.toString())
    // const walletDaemonClient = client().then((c) => c).finally(())
    setClientInstance(walletDaemonClient)
    return new TariUniverseProvider(params, walletDaemonClient)
  }

  public setWindowSize(width: number, height: number): void {
    this.width = width
    this.height = height
  }

  public sendWindowSizeMessage(tappletWindow: Window | null, targetOrigin: string): void {
    tappletWindow?.postMessage({ height: this.height, width: this.width, type: "resize" }, targetOrigin)
  }

  async runOne(method: TUProviderMethod, args: any[]): Promise<any> {
    const isConnected = this.isConnected()
    const isAuth = this.client.isAuthenticated()
    console.log(">>>>>>>>", isConnected, isAuth)
    if (!isAuth) {
      const auth_token = await this.client.authRequest(["Admin"])
      await this.client.authAccept(auth_token, auth_token)
      console.log(">>>>>>>> auth token", auth_token)
    }
    console.log(">>>>>>>>", isConnected, isAuth)
    let res = (this[method] as (...args: any) => Promise<any>)(...args)
    return res
  }

  public async createFreeTestCoins(accountName?: string, amount = 1_000_000, fee?: number): Promise<Account> {
    //TODO tmp solution to debug rpc call problem
    console.log("create coins")
    const res = await accountsCreateFreeTestCoins({
      account: (accountName && { Name: accountName }) || null,
      amount,
      max_fee: fee ?? null,
      key_id: null,
    })
    console.log("create coins res", res)
    // const res = await this.client.createFreeTestCoins({
    //   account: { Name: "jogabonito" },
    //   amount,
    //   max_fee: null,
    //   key_id: 0,
    // })
    return {
      account_id: res.account.key_index,
      address: (res.account.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    }
  }

  public async createAccount(accountName?: string, amount = 1_000_000, fee?: number): Promise<Account> {
    console.log("create coins")
    const res = await accountsCreate({
      account_name: accountName ?? null,
      custom_access_rules: null,
      is_default: true,
      key_id: null,
      max_fee: null,
    })
    console.log("create coins res", res)
    // const res = await this.client.createFreeTestCoins({
    //   account: { Name: "jogabonito" },
    //   amount,
    //   max_fee: null,
    //   key_id: 0,
    // })
    return {
      account_id: 0,
      address: (res.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    }
  }

  public requestParentSize(): Promise<WindowSize> {
    return new Promise<WindowSize>((resolve, _reject) => resolve({ width: this.width, height: this.height }))
  }

  public async getAccount(): Promise<Account> {
    const { account, public_key } = (await this.client.accountsGetDefault({})) as any

    return {
      account_id: account.key_index,
      address: account.address.Component,
      public_key,
      // TODO
      resources: [],
    }
  }

  public async getAccountBalances(componentAddress: string): Promise<AccountsGetBalancesResponse> {
    return await this.client.accountsGetBalances({
      account: { ComponentAddress: componentAddress },
      refresh: true,
    })
  }

  public async getSubstate(substate_id: string): Promise<Substate> {
    const substateId = stringToSubstateId(substate_id)
    const { value, record } = await this.client.substatesGet({ substate_id: substateId })
    return {
      value,
      address: {
        substate_id: substateIdToString(record.substate_id),
        version: record.version,
      },
    }
  }

  public async submitTransaction(req: SubmitTransactionRequest): Promise<SubmitTransactionResponse> {
    // const txParams = {
    //   transaction: null, // TODO figure out what this is
    //   signing_key_index: req.account_id,
    //   fee_instructions: req.fee_instructions as Instruction[],
    //   instructions: req.instructions as Instruction[],
    //   inputs: req.required_substates.map((s) => ({
    //     // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
    //     substate_id: s.substate_id as any,
    //     version: s.version || null,
    //   })),
    //   override_inputs: false,
    //   is_dry_run: req.is_dry_run,
    //   proof_ids: [],
    //   min_epoch: null,
    //   max_epoch: null,
    // }
    // satisfies TransactionSubmitRequest

    console.log("============> TU PROVIDER")

    const txParams: TransactionSubmitRequest = {
      transaction: {
        fee_instructions: req.fee_instructions as Instruction[],
        instructions: req.instructions as Instruction[],
        inputs: req.required_substates.map((s) => ({
          // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
          substate_id: s.substate_id as any,
          version: s.version || null,
        })),
        min_epoch: null,
        max_epoch: null,
      },
      autofill_inputs: [],
      detect_inputs: false,
      proof_ids: [],
      signing_key_index: null,
    }
    console.log("============> TU PROVIDER TX", txParams)
    const res = await this.client.submitTransaction(txParams)
    console.log("============> TU PROVIDER RESPONSE", res)

    return { transaction_id: res.transaction_id }
  }

  public async getTransactionResult(transactionId: string): Promise<TransactionResult> {
    const res = await this.client.getTransactionResult({
      transaction_id: transactionId,
    })

    return {
      transaction_id: transactionId,
      status: convertStringToTransactionStatus(res.status),
      result: res.result as any,
    }
  }

  public async getPublicKey(branch: string, index: number): Promise<string> {
    const res = await this.client.createKey({ branch: branch as KeyBranch, specific_index: index })
    return res.public_key
  }

  public async getTemplateDefinition(template_address: string): Promise<TemplateDefinition> {
    return await this.client.templatesGet({ template_address })
  }

  public async getConfidentialVaultBalances(
    viewKeyId: number,
    vaultId: string,
    min: number | null = null,
    max: number | null = null
  ): Promise<VaultBalances> {
    const res = await this.client.viewVaultBalance({
      view_key_id: viewKeyId,
      vault_id: vaultId,
      minimum_expected_value: min,
      maximum_expected_value: max,
    })
    return { balances: res.balances as unknown as Map<string, number | null> }
  }

  public async listSubstates(
    filter_by_template: string | null,
    filter_by_type: SubstateType | null,
    limit: number | null,
    offset: number | null
  ): Promise<ListSubstatesResponse> {
    const res = await this.client.substatesList({
      filter_by_template,
      filter_by_type,
      limit: limit ? BigInt(limit) : null,
      offset: offset ? BigInt(offset) : null,
    })
    const substates = res.substates.map((s) => ({
      substate_id: substateIdToString(s.substate_id),
      parent_id: null,
      module_name: s.module_name,
      version: s.version,
      template_address: s.template_address,
    }))

    return { substates }
  }
}

function convertStringToTransactionStatus(status: string): TransactionStatus {
  switch (status) {
    case "New":
      return TransactionStatus.New
    case "DryRun":
      return TransactionStatus.DryRun
    case "Pending":
      return TransactionStatus.Pending
    case "Accepted":
      return TransactionStatus.Accepted
    case "Rejected":
      return TransactionStatus.Rejected
    case "InvalidTransaction":
      return TransactionStatus.InvalidTransaction
    case "OnlyFeeAccepted":
      return TransactionStatus.OnlyFeeAccepted
    default:
      throw new Error(`Unknown status: ${status}`)
  }
}
