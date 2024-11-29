import { List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { accountSelector } from "../store/account/account.selector"
import { substateIdToString } from "@tari-project/typescript-bindings"
import { shortenSubstateAddress } from "../helpers/address"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"

// TODO this component is just tmp to show and control provider/account
export const Account: React.FC = () => {
  const { t } = useTranslation(["components", "common"])
  const currentAccount = useSelector(accountSelector.selectAccount)
  const tappProviders = useSelector(tappletProviderSelector.getAllTappletProviders)
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
          <Typography
            variant="caption"
            textAlign="left"
          >{`Nr of Tapplet Providers: ${tappProviders.ids.length} `}</Typography>
          <List sx={{ width: "100%" }} dense>
            {tappProviders.ids.map((item, index) => (
              <ListItem key={index} dense sx={{ padding: "0px" }}>
                <ListItemText primary={`${item}`} sx={{ margin: 0, padding: "0px" }} />
              </ListItem>
            ))}
          </List>
        </Stack>
      </Paper>
    </>
  )
}
