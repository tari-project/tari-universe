import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"

type TappletProps = {
  source: string
}

export const Tapplet: React.FC<TappletProps> = ({ source }) => {
  const tappletRef = useRef<HTMLIFrameElement | null>(null)
  const provider = useSelector(providerSelector.selectProvider)
  console.log(">>>>>>>>>>> PROVIDER", provider)

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
