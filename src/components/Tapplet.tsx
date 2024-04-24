import { Box } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export type TappletProps = {
  tappletId: string;
};

export function Tapplet({ tappletId }: TappletProps) {
  const [tappletAddress, setTappletAddress] = useState("");

  useEffect(() => {
    invoke("launch_tapplet", { tappletId: tappletId })
      .then((res: unknown) => {
        setTappletAddress(res as string);
      })
      .catch((err: unknown) => {
        console.log("error", err);
      });
    return () => {
      invoke("close_tapplet", { tappletId: tappletId });
      setTappletAddress("");
    };
  }, []);

  return (
    <Box>
      <iframe src={tappletAddress} width="100%" height="500"></iframe>
    </Box>
  );
}
