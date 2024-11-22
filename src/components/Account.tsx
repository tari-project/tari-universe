import { Paper, Stack, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { accountSelector } from "../store/account/account.selector"
import { substateIdToString } from "@tari-project/typescript-bindings"
import { shortenSubstateAddress } from "../helpers/address"

// TODO this component is just mvp to displat active account
export const Account: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const currentAccount = useSelector(accountSelector.selectAccount)

  const accountAddress = substateIdToString(currentAccount?.account.address ?? null)
  return (
    <>
      <Paper variant="outlined" elevation={0} sx={{ padding: 1, borderRadius: 2, width: "100%" }}>
        <Stack direction="column" justifyContent="flex-end">
          <Typography
            variant="caption"
            textAlign="left"
          >{`Id: ${currentAccount?.account.key_index} name: ${currentAccount?.account.name}`}</Typography>
          <Typography variant="caption" textAlign="left">{`${t("address", {
            ns: "common",
          })}: ${shortenSubstateAddress(accountAddress)}`}</Typography>
        </Stack>
      </Paper>
    </>
  )
}
