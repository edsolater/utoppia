import {
  Piv,
  PivProps,
  createRef,
  icssCyberpenkBackground,
  icssCyberpenkBorder,
  useElementSize,
} from "@edsolater/pivkit"
import { createMemo } from "solid-js"

export function CyberPanel(props: PivProps) {
  // -------- determine size  --------
  const [ref, setRef] = createRef<HTMLElement>()
  const { width, height } = useElementSize(ref)
  const isHeightSmall = createMemo(() => (height() ?? Infinity) < 500)
  const isWidthSmall = createMemo(() => (width() ?? Infinity) < 800)
  return (
    <Piv
      domRef={setRef}
      icss={[
        {
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        },
        icssCyberpenkBackground,
        icssCyberpenkBorder({ borderRadius: "24px" }),
      ]}
      shadowProps={props}
    />
  )
}
