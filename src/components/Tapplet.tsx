import { useEffect, useRef } from "react"
import { TUInternalProvider } from "@provider/TUInternalProvider"

type TappletProps = {
  source: string
  provider: TUInternalProvider
}

export const Tapplet: React.FC<TappletProps> = ({ source, provider }) => {
  const tappletRef = useRef<HTMLIFrameElement | null>(null)
  function sendWindowSize() {
    if (tappletRef.current) {
      const height = tappletRef.current.offsetHeight
      const width = tappletRef.current.offsetWidth
      const tappletWindow = tappletRef.current.contentWindow

      provider?.setWindowSize(width, height)
      provider?.sendWindowSizeMessage(tappletWindow, source)
    }
  }

  function responseSizeRequest(event: MessageEvent) {
    if (event.data.type === "request-parent-size") {
      if (tappletRef.current) {
        const height = tappletRef.current.offsetHeight
        const width = tappletRef.current.offsetWidth
        const tappletWindow = tappletRef.current.contentWindow

        provider?.setWindowSize(width, height)
        provider?.sendWindowSizeMessage(tappletWindow, source)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("resize", sendWindowSize)
    window.addEventListener("message", responseSizeRequest)

    return () => {
      window.removeEventListener("resize", sendWindowSize)
      window.removeEventListener("message", responseSizeRequest)
    }
  }, [])

  return <iframe src={source} width="100%" height="100%" ref={tappletRef} onLoad={sendWindowSize}></iframe>
}
