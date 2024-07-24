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

export default function AddDevTappletDialog() {
  const [open, setOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const dispatch = useDispatch()

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
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
        Add dev tapplet
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: onSubmitHandler,
        }}
      >
        <DialogTitle textAlign="center">Add dev tapplet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add tapplet in developer mode please enter the endpoint of the tapplet.
          </DialogContentText>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
