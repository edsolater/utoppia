import type { ICSS, KitProps, PivChild, PivProps } from "@edsolater/pivkit"
import {
  AddProps,
  Box,
  Piv,
  PopPortal,
  createDisclosure,
  createDomRef,
  cssOpacity,
  draggablePlugin,
  icssCardPanel,
  icssClickable,
  useKitProps,
  usePlugin,
} from "@edsolater/pivkit"
import { colors } from "../theme/colors"

export type FloatPanelProps = {
  thumbnailIcon?: PivChild
  content?: PivChild
  moveHandlerIcss?: ICSS
  panelIcss?: ICSS
}

export function FloatingInfoPanel(kitProps: KitProps<FloatPanelProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "FloatPanel" })
  const { dom: handler, setDom: setHandlerDom } = createDomRef()
  const [isOpened, { open, close, toggle }] = createDisclosure()
  const defaultThumbnail = () => (
    <Box
      icss={{
        borderRadius: "50%",
        width: "6em",
        height: "6em",
        background: "dodgerblue",
        color: "white",
        display: "grid",
        placeContent: "center",
      }}
    >
      open👋
    </Box>
  )
  const [plugin] = usePlugin(draggablePlugin, {
    handlerElement: handler,
    unsetMoveInEnd: false,
  })
  return (
    <>
      <AddProps icss={[icssClickable]} onClick={() => toggle()}>
        {props.thumbnailIcon ?? defaultThumbnail()}
      </AddProps>

      <PopPortal name="FloatingInfoPanel">
        <Box
          // shadowProps={shadowProps}
          icss={[
            {
              visibility: isOpened() ? "visible" : "hidden",
              borderRadius: "16px",
              paddingTop: "20px",
            },
            icssCardPanel,
            props.panelIcss,
          ]}
          plugin={[
            plugin,
            // resizablePlugin.config({
            //   canResizeX: true,
            //   canResizeY: true,
            // }),
          ]}
        >
          <DragHandler domRef={setHandlerDom} icss={props.moveHandlerIcss} />
          <Box>{props.content ?? props.children}</Box>
        </Box>
      </PopPortal>
    </>
  )
}

function DragHandler(additionProps: PivProps) {
  return (
    <Piv // Drag Handler
      shadowProps={additionProps}
      icss={{
        position: "absolute",
        left: "50%",
        top: "8px",
        transform: "translateX(-50%)",

        width: "40px",
        height: "6px",
        backgroundColor: `${cssOpacity(colors.textPrimary, 0.4)}`,

        // backgroundClip:'content-box',
        borderRadius: "999px",

        "&::before": {
          content: "''",
          position: "absolute",
          inset: "-1em",
          background: "transparent",
          borderRadius: "inherit",
        },
      }}
    />
  )
}
