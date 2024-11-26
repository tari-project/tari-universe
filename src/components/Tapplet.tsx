import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"
import { tappletProviderSelector } from "../store/tappletProviders/tappletProviders.selector"
import { RootState } from "../store/store"

type TappletProps = {
  source: string
  tappletId: number
}
const selectTappProviderById = (state: RootState, id?: number) =>
  id ? tappletProviderSelector.getTappletProviderById(state, id) : null

export const Tapplet: React.FC<TappletProps> = ({ source, tappletId }) => {
  const tappletRef = useRef<HTMLIFrameElement | null>(null)
  const provider = useSelector(providerSelector.selectProvider)
  const tappProvider = useSelector((state: RootState) => selectTappProviderById(state, tappletId))
  console.log("#### TAPP PROVIDER", tappletId, tappProvider)

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
