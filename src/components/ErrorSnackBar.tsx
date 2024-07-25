import { useDispatch, useSelector } from "react-redux"
import { errorSelector } from "../store/error/error.selector"
import { errorActions } from "../store/error/error.slice"
import { Alert, Snackbar } from "@mui/material"

export const ErrorSnackBar = () => {
  const { isVisible, message, typeColor } = useSelector(errorSelector.selectError)
  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(errorActions.hideError())
  }

  return (
    <Snackbar
      open={isVisible}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={typeColor}>
        {message}
      </Alert>
    </Snackbar>
  )
}
