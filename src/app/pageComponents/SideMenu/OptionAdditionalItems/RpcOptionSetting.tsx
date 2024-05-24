import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import {
  Badge,
  Box,
  Button,
  Fragnment,
  Icon,
  Input,
  KitProps,
  List,
  Panel,
  Piv,
  Row,
  Text,
  buildPopover,
  cssCurrentColor,
  cssOpacity,
  cssVar,
  icssCard,
  icssCyberpenkBackground,
  icssDivider,
  icssTextColor,
  useKitProps,
} from "@edsolater/pivkit"
import { shuck_rpc, setStore, store } from "../../../stores/data/store"
import { RPCEndpoint, availableRpcs } from "../../../stores/data/RPCEndpoint"
import { OptionItemBox } from "./OptionItem"
import { unwrap } from "solid-js/store"

export function RpcSettingFace(kitProps: {
  currentRPC?: RPCEndpoint
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  const { props, shadowProps } = useKitProps(kitProps)
  const { plugins: popoverPlugins } = buildPopover({
    placement: "right",
    triggerBy: "click",
    defaultOpen: false,
  }) // <-- run on define, not good
  const dotIcss = {
    width: "0.375rem",
    height: "0.375rem",
    background: "#2de680",
    color: "#2de680",
    borderRadius: "50%",
    boxShadow: "0 0 6px 1px currentColor",
  }
  return (
    <>
      <OptionItemBox
        plugin={popoverPlugins.trigger}
        render:arrow
        render:dot={<Piv icss={dotIcss}></Piv>}
        shadowProps={shadowProps}
      >
        RPC:({store.rpc?.url ?? "none"})
      </OptionItemBox>
      <Panel plugin={popoverPlugins.panel} icss={[{ width: "24rem" }, icssCard, icssCyberpenkBackground]}>
        <RPCPanel
          currentRPC={props.currentRPC}
          availableRpcs={availableRpcs}
          isLoading={props.isLoading}
          isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
        ></RPCPanel>
      </Panel>
    </>
  )
}

function RPCPanel(props: {
  currentRPC?: RPCEndpoint
  availableRpcs?: RPCEndpoint[]
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  return (
    <RPCPanelBox>
      <List items={props.availableRpcs} icss={icssDivider}>
        {(rpc) => (
          <RPCPanelItem
            icss={{ paddingBlock: "0.75rem" }}
            rpc={rpc}
            isCurrent={rpc.url === props.currentRPC?.url}
            isLoading={props.isLoading}
            isLoadingCustomizedRPC={props.isLoadingCustomizedRPC}
            isRecommanded={true}
          />
        )}
      </List>

      <RPCPanelInputBox
        icss={{ flex: 1 }}
        onSwitchRpc={(rpcURL) => {
          setStore({ rpc: { url: rpcURL } })
          shuck_rpc.set({ url: rpcURL })
        }}
      />
    </RPCPanelBox>
  )
}

export function RPCPanelBox(kitProps: KitProps) {
  const { props, shadowProps } = useKitProps(kitProps)
  return (
    <Box shadowProps={shadowProps}>
      <Text
        icss={{
          paddingBlock: "0.75rem",
          // paddingInline: '1.5rem',
          color: cssVar("--secondary-half"),
          fontSize: "0.75rem",
        }}
      >
        RPC CONNECTION
      </Text>
      <Fragnment>{props.children}</Fragnment>
    </Box>
  )
}

function RPCPanelItem(
  kitProps: KitProps<{
    rpc: RPCEndpoint
    isRecommanded?: boolean
    isUserCustomized?: boolean
    isCurrent?: boolean
    isLoading?: boolean
    isLoadingCustomizedRPC?: boolean
    onClickRPCItem?: (rpc: RPCEndpoint) => void
    onDeleteRPCItem?: (rpc: RPCEndpoint) => void
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps)
  const { rpc, isCurrent } = props
  const dotIcss = {
    width: "0.375rem",
    height: "0.375rem",
    background: "#2de680",
    color: "#2de680",
    borderRadius: "50%",
    boxShadow: "0 0 6px 1px currentColor",
  }
  return (
    <Row
      shadowProps={shadowProps}
      class="group flex-wrap gap-3 py-4 px-6 mobile:px-3 border-[rgba(171,196,255,0.05)]"
      onClick={() => {
        props.onClickRPCItem?.(rpc)
      }}
    >
      <Row class="items-center w-full">
        <Row
          icss={{
            width: "100%",
            color: props.isCurrent ? "rgba(255,255,255,0.85)" : "white",
            "&:hover": { color: "white" },
            transition: "color 0.2s",
            cursor: "pointer",
          }}
          icss:gap={".25rem"}
        >
          <Text icss={{ whiteSpace: "nowrap" }}>{props.rpc.name ?? "--"}</Text>

          <Row icss={{ gap: ".5rem" }}>
            {props.isRecommanded && <Badge icss={icssTextColor({ color: "#5ac4be" })}>recommended</Badge>}
            {props.isUserCustomized && <Badge icss={icssTextColor({ color: "#c4d6ff" })}>user added</Badge>}
            {props.isCurrent && <Icon>✅</Icon>}
          </Row>

          {/* delete icon */}
          {props.isRecommanded && !props.isCurrent && (
            <Icon
              onClick={({ ev }) => {
                props.onDeleteRPCItem?.(rpc)
                ev.stopPropagation()
              }}
            >
              💥
            </Icon>
          )}
        </Row>
        {props.isLoading && props.isCurrent && <Icon icss={{ marginLeft: ".75rem" }}>💫</Icon>}
      </Row>
    </Row>
  )
}

function RPCPanelInputBox(kitProps: KitProps<{ onSwitchRpc?(url: string): void }>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const [currentRPCUrl, setCurrentRPCUrl] = createSignal("https://")
  const applyRPCChange = () => {
    props.onSwitchRpc?.(currentRPCUrl())
  }
  return (
    <Row>
      <Input
        shadowProps={shadowProps}
        icss={{ border: "solid", borderColor: cssOpacity(cssCurrentColor, 0.1), borderRadius: "12px" }}
        value={currentRPCUrl}
        onUserInput={setCurrentRPCUrl}
        onEnter={applyRPCChange}
      />
      <Button shadowProps={shadowProps} onClick={applyRPCChange}>
        Switch
      </Button>
    </Row>
  )
}

function RPCPanelInputActionButton(kitProps: KitProps) {
  const { props, shadowProps } = useKitProps(kitProps)
  return <Button shadowProps={shadowProps}>Switch</Button>
}
