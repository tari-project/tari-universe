import {
  WalletDaemonClient,
  stringToSubstateId,
  SubstateType,
  substateIdToString,
  KeyBranch,
  AccountsGetBalancesResponse,
  TransactionSubmitRequest,
  AccountsListResponse,
} from "@tari-project/wallet_jrpc_client"
import {
  Account,
  Instruction,
  SubmitTransactionRequest,
  SubmitTransactionResponse,
  Substate,
  TariProvider,
  TemplateDefinition,
  TransactionResult,
  TransactionStatus,
  VaultBalances,
  WalletDaemonParameters,
} from "@tari-project/tarijs"
import { ListSubstatesResponse } from "@tari-project/tarijs/dist/providers"
import { IPCRpcTransport } from "./ipc_transport"
import { ComponentAccessRules } from "@tari-project/typescript-bindings"

export class TUInternalProvider implements TariProvider {
  public providerName = "TUInternalProvider"
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

  static build(params: WalletDaemonParameters): TUInternalProvider {
    const client = WalletDaemonClient.new(new IPCRpcTransport())
    return new TUInternalProvider(params, client)
  }

  public async createFreeTestCoins(accountName?: string, amount = 1_000_000, fee?: number): Promise<Account> {
    console.log("### free coins", accountName)
    const res = await this.client.createFreeTestCoins({
      account: (accountName && { Name: accountName }) || null,
      amount,
      max_fee: fee ?? null,
      key_id: null,
    })
    console.log("### free coins response", res)
    return {
      account_id: res.account.key_index,
      address: (res.account.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    }
  }

  public async createAccount(
    accountName?: string,
    fee?: number,
    customAccessRules?: ComponentAccessRules,
    isDefault = true
  ): Promise<Account> {
    const res = await this.client.accountsCreate({
      account_name: accountName ?? null,
      custom_access_rules: customAccessRules ?? null,
      is_default: isDefault,
      key_id: null,
      max_fee: fee ?? null,
    })
    return {
      account_id: 0,
      address: (res.address as { Component: string }).Component,
      public_key: res.public_key,
      resources: [],
    }
  }

  public async getAccount(): Promise<Account> {
    const { account, public_key } = (await this.client.accountsGetDefault({})) as any
    const { balances } = await this.client.accountsGetBalances({
      account: { ComponentAddress: account.address.Component },
      refresh: false,
    })

    return {
      account_id: account.key_index,
      address: account.address.Component,
      public_key,
      resources: balances.map((b: any) => ({
        type: b.resource_type,
        resource_address: b.resource_address,
        balance: b.balance + b.confidential_balance,
        vault_id: "Vault" in b.vault_address ? b.vault_address.Vault : b.vault_address,
        token_symbol: b.token_symbol,
      })),
    }
  }

  public async getAccountBalances(componentAddress: string): Promise<AccountsGetBalancesResponse> {
    return await this.client.accountsGetBalances({
      account: { ComponentAddress: componentAddress },
      refresh: true,
    })
  }

  public async getAccountsList(limit = 10, offset = 0): Promise<AccountsListResponse> {
    return await this.client.accountsList({
      limit,
      offset,
    })
  }

  public async getAccountsBalances(
    accountName: string,
    refresh: boolean = false
  ): Promise<AccountsGetBalancesResponse> {
    return await this.client.accountsGetBalances({ account: { Name: accountName }, refresh })
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
      detect_inputs: false, //TODO check if works for 'false'
      proof_ids: [],
    } as TransactionSubmitRequest

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
