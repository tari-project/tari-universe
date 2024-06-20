import { useEffect, useRef, useState } from "react"

type TappletProps = {
  source: string
}

export const Tapplet: React.FC<TappletProps> = ({ source }) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const tappletRef = useRef<HTMLIFrameElement | null>(null)

  function setSize() {
    if (tappletRef.current) {
      const height = tappletRef.current.offsetHeight
      const width = tappletRef.current.offsetWidth
      setHeight(height)
      setWidth(width)

      tappletRef.current.contentWindow?.postMessage({ height, width, type: "resize" }, source)
    }
  }

  function responseSizeRequest(event: MessageEvent) {
    if (event.origin === source && event.data.type === "request-parent-size") {
      if (tappletRef.current) {
        tappletRef.current.contentWindow?.postMessage({ height, width, type: "resize" }, source)
      }
    }
  }

  useEffect(() => {
    window.addEventListener("resize", setSize)
    window.addEventListener("message", responseSizeRequest)

    return () => {
      window.removeEventListener("resize", setSize)
      window.removeEventListener("message", responseSizeRequest)
    }
  }, [])

  return <iframe src={source} width="100%" height="100%" ref={tappletRef} onLoad={setSize}></iframe>
}
