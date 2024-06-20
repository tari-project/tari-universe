import { useEffect, useRef, useState } from "react"

type TappletProps = {
  source: string
}

export const Tapplet: React.FC<TappletProps> = ({ source }) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const tappletRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    setWidth(tappletRef?.current?.offsetWidth || 0)
    setHeight(tappletRef?.current?.offsetHeight || 0)

    const getSize = () => {
      if (tappletRef.current) {
        console.log("inside if")
        setWidth(tappletRef.current.offsetWidth)
        setHeight(tappletRef.current.offsetHeight)
      }
    }
    window.addEventListener("resize", getSize)

    return () => {
      window.removeEventListener("resize", getSize)
    }
  }, [])

  function onTappletLoad() {
    if (tappletRef.current) {
      console.log("inside if")
      setWidth(tappletRef.current.offsetWidth)
      setHeight(tappletRef.current.offsetHeight)
    }
  }

  return <iframe src={source} width="100%" height="100%" ref={tappletRef} onLoad={onTappletLoad}></iframe>
}
