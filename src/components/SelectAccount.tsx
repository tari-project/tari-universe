import { useCallback, useState } from "react"
import Divider from "@mui/material/Divider"
import Box from "@mui/material/Box"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"
import { AccountInfo } from "@tari-project/typescript-bindings"
import { Button, DialogContent, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"

interface SelectAccountProps {
  onSubmit: (name: string) => void
  accountsList: AccountInfo[]
}

function SelectAccount({ onSubmit, accountsList }: SelectAccountProps) {
  const { t } = useTranslation(["components", "common"])
  const [newAccountName, setNewAccountName] = useState("")

  const onSelectChange = () => {
    // TODO
    console.log("TODO: set active account from the list")
  }

  const handleSubmit = useCallback(async () => {
    console.log("submit handle new account", newAccountName)
    return onSubmit(newAccountName)
  }, [newAccountName, onSubmit])

  const onAddAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(accountsList)
    setNewAccountName(e.target.value)
  }

  return (
    <Box sx={{ minWidth: 250 }}>
      <DialogContent className="dialog-content">
        <Box display="flex" flexDirection="row" gap={2} alignItems="center" py={4}>
          <TextField
            name="accountName"
            label="Account Name"
            value={newAccountName}
            onChange={onAddAccountChange}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={handleSubmit} variant="contained" sx={{ width: 200 }}>
            {t("create-account", { ns: "components" })}
          </Button>
        </Box>
      </DialogContent>
      <FormControl fullWidth>
        <InputLabel id="account-select-label">Account</InputLabel>
        <Select
          labelId="account-select-label"
          id="account-select"
          value={
            accountsList.some((account: AccountInfo) => account.account.name == newAccountName) ? newAccountName : ""
          }
          label="Account"
          onChange={onSelectChange}
        >
          {accountsList.map((account: AccountInfo) => {
            if (account.account.name === null) {
              return null
            }
            return (
              <MenuItem key={account.public_key} value={account.account.name}>
                {account.account.name}
              </MenuItem>
            )
          })}
          <Divider />
        </Select>
      </FormControl>
    </Box>
  )
}

export default SelectAccount
