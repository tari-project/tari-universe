import {
  WalletDaemonClient,
  stringToSubstateId,
  SubstateType,
  substateIdToString,
  KeyBranch,
  AccountsGetBalancesResponse,
  TransactionSubmitRequest,
} from "@tari-project/wallet_jrpc_client"
import {
  Account,
  Instruction,
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
import {
  accountsCreate,
  accountsCreateFreeTestCoins,
  authenticateClient,
  DEFAULT_WALLET_ADDRESS,
  setClientInstance,
  // DEFAULT_WALLET_ADDRESS,
  // setClientInstance,
} from "./json_rpc"
import { TUProviderMethod } from "../store/transaction/transaction.types"
import { IPCRpcTransport } from "./ipc_transport"

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

export class TariUniverseProvider implements TariProvider {
  public providerName = "TariUniverseProvider"
  params: WalletDaemonParameters
  client: WalletDaemonClient
  isProviderConnected: boolean

  private constructor(
    params: WalletDaemonParameters,
    connection: WalletDaemonClient,
    public width = 0,
    public height = 0
  ) {
    this.params = params
    this.client = connection
    this.isProviderConnected = true
  }

  public isConnected(): boolean {
    return this.isProviderConnected //TODO tmp solution shoule be better one
  }

  public async getClient(): Promise<WalletDaemonClient> {
    return this.client
  }

  static build(params: WalletDaemonParameters): TariUniverseProvider {
    const allPermissions = new TariPermissions()
    allPermissions.addPermissions(params.permissions)
    allPermissions.addPermissions(params.optionalPermissions)
    const walletDaemonClient = WalletDaemonClient.usingFetchTransport(DEFAULT_WALLET_ADDRESS.toString())
    setClientInstance(walletDaemonClient)
    return new TariUniverseProvider(params, walletDaemonClient)
    // const client = WalletDaemonClient.new(new IPCRpcTransport())
    // return new TariUniverseProvider(params, client)
  }

  public setWindowSize(width: number, height: number): void {
    this.width = width
    this.height = height
  }

  public sendWindowSizeMessage(tappletWindow: Window | null, targetOrigin: string): void {
    tappletWindow?.postMessage({ height: this.height, width: this.width, type: "resize" }, targetOrigin)
  }

  async runOne(method: TUProviderMethod, args: any[]): Promise<any> {
    console.log(">>> runOne", method, args)
    const isAuth = this.client.isAuthenticated()
    console.log(">>> runOne isAuth", isAuth)
    if (!isAuth) {
      await authenticateClient(this.client)
    }
    let res = (this[method] as (...args: any) => Promise<any>)(...args)
    console.log(">>> runOne", res)
    return res
  }

  public async createFreeTestCoins(accountName?: string, amount = 1_000_000, fee?: number): Promise<Account> {
    //TODO tmp solution to debug rpc call problem
    console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ")
    console.log("create coins - TARI UNIVERSE PROVIDER")
    const res = await accountsCreateFreeTestCoins({
      account: (accountName && { Name: accountName }) || null,
      amount,
      max_fee: fee ?? null,
      key_id: null,
    })
    console.log("create coins res", res)
    return {
      account_id: res.account.key_index,
      address: (res.account.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    }
  }

  public async createAccount(accountName?: string, fee?: number): Promise<Account> {
    console.log("create coins")
    const res = await accountsCreate({
      account_name: accountName ?? null,
      custom_access_rules: null,
      is_default: true,
      key_id: null,
      max_fee: fee ?? null,
    })
    console.log("create coins res", res)
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
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(" submit tx TU Provider", req)
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

    const params = {
      transaction: {
        instructions: req.instructions as Instruction[],
        fee_instructions: req.fee_instructions as Instruction[],
        inputs: req.required_substates.map((s) => ({
          // TODO: Hmm The bindings want a SubstateId object, but the wallet only wants a string. Any is used to skip type checking here
          substate_id: s.substate_id as any,
          version: null,
        })),
        min_epoch: null,
        max_epoch: null,
      },
      signing_key_index: req.account_id,
      autofill_inputs: [],
      detect_inputs: false, //TODO
      proof_ids: [],
    } as unknown as TransactionSubmitRequest
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!! submit tx TU Provider", params)

    const res = await this.client.submitTransaction(params)

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
