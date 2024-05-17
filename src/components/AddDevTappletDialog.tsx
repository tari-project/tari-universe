import * as React from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { invoke } from "@tauri-apps/api/core"
import { useSnackBar } from "../ErrorContext"

export default function AddDevTappletDialog() {
  const [open, setOpen] = React.useState(false)
  const { showSnackBar } = useSnackBar()

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries((formData as any).entries())
    const endpoint = formJson.endpoint
    try {
      await invoke("add_dev_tapplet", { endpoint })
      handleClose()
    } catch (error) {
      showSnackBar(error, "error")
    }
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <React.Fragment>
      <Button variant="contained" onClick={handleClickOpen}>
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
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add tapplet in developer mode please enter the endpoint of the tapplet.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="endpoint"
            label="Tapplet Endpoint"
            type="url"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
