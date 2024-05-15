import { Box } from "@mui/material"
import { useLocation } from "react-router-dom"
import { DevTapplet } from "./TappletsInstalled"

export function ActiveDevTapplet() {
  let { state }: { state: DevTapplet } = useLocation()

  return (
    <div>
      {state?.endpoint && (
        <Box>
          <iframe src={state.endpoint} width="100%" height="500"></iframe>
        </Box>
      )}
    </div>
  )
}
