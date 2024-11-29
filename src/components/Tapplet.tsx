import { useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { transactionActions } from "../store/transaction/transaction.slice"
import { TappletProvider } from "@provider/TappletProvider"

type TappletProps = {
  source: string
  provider: TappletProvider
}

export const Tapplet: React.FC<TappletProps> = ({ source, provider }) => {
  const tappletRef = useRef<HTMLIFrameElement | null>(null)
  const dispatch = useDispatch()

  function sendWindowSize() {
    if (tappletRef.current) {
      const height = tappletRef.current.offsetHeight
      const width = tappletRef.current.offsetWidth
      const tappletWindow = tappletRef.current.contentWindow

      provider?.setWindowSize(width, height)
      provider?.sendWindowSizeMessage(tappletWindow, source)
    }
  }

  function handleMessage(event: MessageEvent) {
    console.log("[Tapplet] handle message type", event.data.type)
    if (event.data.type === "request-parent-size") {
      if (tappletRef.current) {
        const height = tappletRef.current.offsetHeight
        const width = tappletRef.current.offsetWidth
        const tappletWindow = tappletRef.current.contentWindow

        provider?.setWindowSize(width, height)
        provider?.sendWindowSizeMessage(tappletWindow, source)
      }
    } else if (event.data.type === "provider-call") {
      console.log("[Tapplet] Tapplet", event.data)
      dispatch(transactionActions.initializeRequest({ provider, event }))
    }
  }

  useEffect(() => {
    console.log("inisde useeffect")
    window.addEventListener("resize", sendWindowSize)
    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("resize", sendWindowSize)
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  return <iframe src={source} width="100%" height="100%" ref={tappletRef} onLoad={sendWindowSize}></iframe>
}
