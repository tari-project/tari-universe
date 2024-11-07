import {
  TariPermissionAccountBalance,
  TariPermissionAccountInfo,
  TariPermissionAccountList,
  TariPermissionGetNft,
  TariPermissionKeyList,
  TariPermissionNftGetOwnershipProof,
  TariPermissionTransactionGet,
  TariPermissionTransactionSend,
} from "@tari-project/tarijs/dist/providers/wallet_daemon/tari_permissions"

export function parse(permission: any) {
  if (permission.hasOwnProperty("AccountBalance")) {
    return new TariPermissionAccountBalance(permission.AccountBalance)
  } else if (permission === "AccountInfo") {
    return new TariPermissionAccountInfo()
  } else if (permission.hasOwnProperty("AccountList")) {
    return new TariPermissionAccountList(permission.AccountList)
  } else if (permission == "KeyList") {
    return new TariPermissionKeyList()
  } else if (permission.hasOwnProperty("TransactionSend")) {
    return new TariPermissionTransactionSend(permission.TransactionSend)
  } else if (permission === "TransactionGet") {
    return new TariPermissionTransactionGet()
  } else if (permission.hasOwnProperty("GetNft")) {
    return new TariPermissionGetNft(permission.GetNft)
  } else if (permission.hasOwnProperty("NftGetOwnershipProof")) {
    return new TariPermissionNftGetOwnershipProof(permission.NftGetOwnershipProof)
  }
  return permission
}
