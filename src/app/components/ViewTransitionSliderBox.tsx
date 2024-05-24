import { Box, createDomRef, useKitProps, type KitProps } from "@edsolater/pivkit"
import { createEffect, on } from "solid-js"

export type ViewTransitionSliderBoxProps = {
  /** change this will cause view transition */
  contentIndex?: number
  direction?: "horizontal" | "vertical"
}

export type ViewTransitionSliderBoxKitProps = KitProps<ViewTransitionSliderBoxProps>

// 🔥already in pivkit
export function ViewTransitionSliderBox(kitProps: ViewTransitionSliderBoxKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "ViewTransitionSliderBox" })

  const { dom: boxRef, setDom: setBoxDom } = createDomRef<HTMLDivElement>()
  const { dom: prevBoxRef, setDom: setPrevBoxDom } = createDomRef<HTMLDivElement>()
  const { dom: nextBoxRef, setDom: setNextBoxDom } = createDomRef<HTMLDivElement>()
  const { dom: currBoxRef, setDom: setCurrBoxDom } = createDomRef<HTMLDivElement>()
  const transitionCSS = ".3s ease-out"

  createEffect(
    on(
      [() => props.contentIndex, boxRef, prevBoxRef, nextBoxRef, currBoxRef],
      ([contentIndex, box, prevBox, nextBox, currBox], prev) => {
        const [prevContentIndex] = prev ?? []
        if (!box) return
        if (!currBox) return
        const newClonedNode = currBox.cloneNode(true)

        const justCurrent = prevContentIndex == null
        if (justCurrent) return

        // start transition
        const toNextIndex = prevContentIndex != null && contentIndex != null && prevContentIndex < contentIndex
        const toPrevIndex = prevContentIndex != null && contentIndex != null && prevContentIndex > contentIndex
        if (toNextIndex) {
          prevBox?.appendChild(newClonedNode)
        }
        if (toPrevIndex) {
          nextBox?.appendChild(newClonedNode)
        }
        box.style.setProperty("transition", "none")
        box.style.setProperty("transform", `translateX(${toNextIndex ? "100%" : "-100%"})`)

        nextBox?.style.removeProperty("transition")
        nextBox?.style.setProperty("opacity", `100`)
        prevBox?.style.removeProperty("transition")
        prevBox?.style.setProperty("opacity", `100`)
        currBox.style.removeProperty("transition")
        currBox.style.setProperty("opacity", `0`)

        box.clientWidth // force render
        nextBox?.clientWidth // force render
        prevBox?.clientWidth // force render
        currBox.clientWidth // force render

        box.style.setProperty("transition", transitionCSS)
        box.style.setProperty("transform", "translateX(0%)")
        nextBox?.style.setProperty("transition", transitionCSS)
        nextBox?.style.setProperty("opacity", `0`)
        prevBox?.style.setProperty("transition", transitionCSS)
        prevBox?.style.setProperty("opacity", `0`)
        currBox.style.setProperty("transition", transitionCSS)
        currBox.style.setProperty("opacity", `100`)

        const handleTransitionEnd = () => {
          box.style.removeProperty("transform")
          box.style.removeProperty("transition")
          prevBox?.replaceChildren()
          nextBox?.replaceChildren()
          box.removeEventListener("transitionend", handleTransitionEnd)
          box.removeEventListener("transitioncancel", handleTransitionEnd)
        }
        box.addEventListener("transitionend", handleTransitionEnd)
        box.addEventListener("transitioncancel", handleTransitionEnd)
      },
    ),
  )

  return (
    <Box
      class={"window"}
      shadowProps={shadowProps}
      domRef={setBoxDom}
      icss={{
        display: "flex",
        flexDirection: props.direction === "vertical" ? "column" : "row",
        position: "relative",
        width: "fit-content",
        height: "fit-content",
      }}
      style={{ transition: transitionCSS }}
    >
      <Box
        class={"prev-box"}
        domRef={setPrevBoxDom}
        icss={{ position: "absolute", inset: 0 }}
        style={{ transform: "translateX(-100%)", transition: "inherit" }}
      ></Box>

      <Box
        class={"curr-box"}
        domRef={setCurrBoxDom}
        icss={{ flex: 1 }}
        style={{ transform: "translateX(0%)", transition: "inherit" }}
      >
        {props.children}
      </Box>

      <Box
        class={"next-box"}
        domRef={setNextBoxDom}
        icss={{ position: "absolute", inset: 0 }}
        style={{ transform: "translateX(100%)", transition: "inherit" }}
      ></Box>
    </Box>
  )
}
