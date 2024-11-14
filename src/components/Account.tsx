import { Stack, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { accountSelector } from "../store/account/account.selector"
import { shortenSubstateAddress } from "../helpers/address"

// TODO this component is just mvp to displat active account
export const Account: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const currentAccount = useSelector(accountSelector.selectAccount)

  const accountAddress = (currentAccount?.account.address as any) ?? ""
  return (
    <>
      <Stack direction="column" justifyContent="flex-end">
        <Typography variant="caption" textAlign="left">{`Name: ${currentAccount?.account.name}`}</Typography>
        <Typography variant="caption" textAlign="left">{`${t("address", {
          ns: "common",
        })}: ${shortenSubstateAddress(accountAddress)}`}</Typography>
      </Stack>
    </>
  )
}
