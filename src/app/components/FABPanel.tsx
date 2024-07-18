import type { ICSS, KitProps, PivChild, PivProps } from "@edsolater/pivkit"
import {
  AddProps,
  Box,
  Piv,
  PopoverPanel,
  createDisclosure,
  createDomRef,
  cssOpacity,
  draggablePlugin,
  icssCardPanel,
  icssClickable,
  useKitProps,
  usePlugin,
} from "@edsolater/pivkit"
import { colors } from "../../app/theme/colors"

export type FABPanelProps = {
  thumbnailIcon?: PivChild
  content?: PivChild
  moveHandlerIcss?: ICSS
  panelIcss?: ICSS
}

export function FABPanel(kitProps: KitProps<FABPanelProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "FABPanel" })
  const [isOpened, { toggle }] = createDisclosure(false)
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

  return (
    <>
      <AddProps icss={[icssClickable]} onClick={() => toggle()}>
        {props.thumbnailIcon ?? defaultThumbnail()}
      </AddProps>

      <FloatingPanel
        open={isOpened}
        shadowProps={[shadowProps, { icss: props.panelIcss }]}
        propsofDragHandler={{ icss: props.moveHandlerIcss }}
      >
        {props.content ?? props.children}
      </FloatingPanel>
    </>
  )
}

/** should use more composable {@link DraggablePanel} */
export function FloatingPanel(
  kitProps: KitProps<{ open?: boolean; defaultOpen?: boolean; propsofDragHandler?: PivProps }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "FloatingPanel" })
  const { dom: handler, setDom: setHandlerDom } = createDomRef()
  const [plugin] = usePlugin(draggablePlugin, {
    handlerElement: handler,
    unsetMoveInEnd: false,
  })
  return (
    <PopoverPanel
      shadowProps={shadowProps}
      open={props.open}
      defaultOpen={props.defaultOpen}
      plugin={plugin}
      icss={[
        {
          borderRadius: "16px",
          paddingTop: "20px",
        },
        icssCardPanel(),
      ]}
    >
      <DragHandler domRef={setHandlerDom} shadowProps={props.propsofDragHandler} />
      <Box>{props.children}</Box>
    </PopoverPanel>
  )
}

export function DraggablePanel(
  kitProps: KitProps<{ open?: boolean; defaultOpen?: boolean; propsofDragHandler?: PivProps }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DraggablePanel" })
  const { dom: handler, setDom: setHandlerDom } = createDomRef()
  const [plugin] = usePlugin(draggablePlugin, {
    handlerElement: handler,
    unsetMoveInEnd: false,
  })
  return (
    <Box
      shadowProps={shadowProps}
      plugin={plugin}
      icss={[
        {
          borderRadius: "16px",
          padding: "12px",
          paddingTop: "20px",
          background: colors.card
        },
        icssCardPanel,
      ]}
    >
      <DragHandler domRef={setHandlerDom} shadowProps={props.propsofDragHandler} />
      <AddProps>{props.children}</AddProps>
    </Box>
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
        zIndex: "99",
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
