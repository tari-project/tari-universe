import { FormEvent, Fragment, useState } from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { devTappletsActions } from "../store/devTapplets/devTapplets.slice"
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next"

export default function AddDevTappletDialog() {
  const { t } = useTranslation(["components", "common"])
  const [open, setOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const dispatch = useDispatch()

  const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries())
    const endpoint = formJson.endpoint
    try {
      dispatch(devTappletsActions.addDevTappletRequest({ endpoint }))
      handleClose()
    } catch (error) {
      setHasError(true)
      setErrorMsg(error as string)
    }
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Fragment>
      <Button variant="contained" onClick={handleClickOpen} sx={{ width: 200, ml: 1 }}>
        {t("add-dev-taplet", { ns: "components" })}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: onSubmitHandler,
        }}
      >
        <DialogTitle textAlign="center">{t("add-dev-taplet", { ns: "components" })}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("add-dev-taplet-description", { ns: "components" })}</DialogContentText>
          <TextField
            error={hasError}
            helperText={errorMsg}
            onChange={() => {
              setHasError(false)
              setErrorMsg("")
            }}
            autoFocus
            required
            margin="dense"
            id="name"
            name="endpoint"
            label="Tapplet Endpoint"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel", { ns: "common" })}</Button>
          <Button type="submit">{t("add", { ns: "common" })}</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
