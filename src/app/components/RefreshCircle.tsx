import { Box, KitProps, icssClickable, useKitProps } from "@edsolater/pivkit"
import { createMemo } from "solid-js"
import { usePercentLoop } from "../hooks/usePercentLoop"

interface RefreshCircleRawProps {
  /** like animation run */
  run?: boolean
  // duration?: number
  strokeWidth?: string | number
  // updateDelay?: number
  svgWidth?: number
  // can be trigger by user manually reset or one round auto reset
  onRefresh?: () => void

  /** @default 1000 * 60 ms */
  duration?: number
}

type RefreshCircleProps = KitProps<RefreshCircleRawProps>

// TODO: should move to pivkit in future
export function RefreshCircle(kitProps: RefreshCircleProps) {
  const { props, shadowProps } = useKitProps(kitProps, { defaultProps: { svgWidth: 36, strokeWidth: 3, percent: 0.3 } })
  const totalDuration = props.duration ?? 1000 * 60
  const r = createMemo(() => (0.5 * props.svgWidth) / 2)
  const c = createMemo(() => 2 * r() * Math.PI)
  const { percent, reset } = usePercentLoop({
    onRoundEnd: () => {
      props.onRefresh?.()
    },
    eachSecondPercent: 1000 / totalDuration,
    canRoundCountOverOne: true,
  })
  const dashOffset = createMemo(() => {
    const mod = percent() % 1
    if (mod === 0) {
      return 0
    } else {
      return c() - mod * c()
    }
  })

  const manuallyRefresh = () => {
    props.onRefresh?.()
    reset()
  }
  // fade looper indicator
  // let tempCircleBar: SVGCircleElement | null = null
  // createEffect(
  //   on(percent, (percent, prevPrecent) => {
  //     if (!tempCircleBar) return
  //     // when percent accross 1, show temp-bar with transition
  //     if (!prevPrecent) return
  //     if (Math.floor(percent) !== Math.floor(prevPrecent)) {
  //       console.log(3)
  //       tempCircleBar.style.removeProperty("transition")
  //       tempCircleBar.clientHeight
  //       tempCircleBar.style.setProperty("opacity", "1")
  //       tempCircleBar.clientWidth
  //       setTimeout(() => {
  //         tempCircleBar?.style.setProperty("transition", "opacity 0.5s")
  //         tempCircleBar?.clientWidth
  //         setTimeout(() => {
  //           tempCircleBar?.style.setProperty("opacity", "0")
  //         })
  //       }, 88)
  //     }
  //   }),
  // )
  return (
    <Box
      shadowProps={shadowProps}
      icss={icssClickable}
      onClick={manuallyRefresh}
      style={{
        width: "100%",
        height: "100%",
        transform: "translateZ(0)", // to be an isolated render layer
      }}
    >
      <svg width={props.svgWidth} height={props.svgWidth} viewBox={`0 0 ${props.svgWidth} ${props.svgWidth}`}>
        <circle
          id="track"
          r={r()}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{
            "stroke-width": `${props.strokeWidth}px`,
            stroke: "currentcolor",
            opacity: 0.1,
            "transform-origin": "center",
            "stroke-linecap": "round",
          }}
        />

        <circle
          id="bar"
          r={r()}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{
            "stroke-width": `${props.strokeWidth}px`,
            "stroke-dasharray": String(c()),
            "stroke-dashoffset": String(dashOffset()),
            stroke: "currentcolor",
            transform: "rotate(-90deg)",
            "transform-origin": "center",
            "stroke-linecap": "round",
          }}
        />

        {/* only-when percent accross 1 can see this circle
        <circle
          id="temp-bar"
          r={r()}
          ref={(el) => (tempCircleBar = el)}
          cx="50%"
          cy="50%"
          fill="transparent"
          style={{
            opacity: 0,
            "stroke-width": `${props.strokeWidth}px`,
            stroke: "dodgerblue",
            transform: "rotate(-90deg)",
            "transform-origin": "center",
            "stroke-linecap": "round",
          }}
        /> */}
      </svg>
    </Box>
  )
}
