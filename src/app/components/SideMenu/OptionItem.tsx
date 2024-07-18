import { AnyFn, isFunction, isObject, switchCase } from "@edsolater/fnkit"
import {
  Box,
  Icon,
  KitProps,
  PivChild,
  Row,
  Span,
  createICSS,
  cssOpacity,
  useKitProps
} from "@edsolater/pivkit"
import { Link } from "../Link"
import { colors } from "../../theme/colors"

export type OptionItemBoxProps = {
  /** @default true */
  ["defineDot"]?: boolean | PivChild | (() => PivChild)
  // NOTE: when start with 'visible' this part of component can be shown, 🤔 just whether 'render:' exist is enough ?
  /** @default false */
  ["defineArrow"]?: boolean | PivChild | (() => PivChild)
  iconSrc?: string
  href?: string
}

const icssOptionItemBox = createICSS(() => ({
  display: "block",
  paddingBlock: "0.75rem",
  paddingInline: "2rem",
  "&:hover": {
    backgroundColor: cssOpacity(colors.ternary, 0.1),
  },
  "&:active": {
    backgroundColor: cssOpacity(colors.ternary, 0.1),
  },
  cursor: "pointer",
  position: "relative",
}))

export function OptionItemBox(kitProps: KitProps<OptionItemBoxProps>) {
  const { props, shadowProps } = useKitProps(kitProps, {
    defaultProps: { ["defineArrow"]: true, ["defineDot"]: true },
  })
  const subComponentsRender = {
    dot: () => (
      <Box
        icss={[
          { display: "grid", placeItems: "center" },
          { width: "1rem", height: "1rem", marginInlineEnd: "0.75rem", color: colors.ternary },
        ]}
      >
        {switchCase<boolean | PivChild | (() => PivChild), any>(
          props["defineDot"],
          [
            [(v) => isObject(v), (v) => v],
            [(v) => isFunction(v), (v) => (v as AnyFn)()],
            [(v) => v === true, () => <Icon src={props.iconSrc} />],
          ],
          null,
        )}
      </Box>
    ),
    arrow: () =>
      /* TODO: add arrow */ switchCase(
        props["defineArrow"],
        [
          [(v) => isObject(v), (v) => v],
          [(v) => isFunction(v), (v) => (v as AnyFn)()],
          [(v) => v === true, () => <Icon icss={{ marginInlineEnd: "0.75rem", color: colors.ternary }} size={"sm"} />],
        ],
        null,
      ),
  }

  return (
    <Link shadowProps={shadowProps} href={props.href} icss={icssOptionItemBox}>
      <Row icss={{ alignItems: "center" }}>
        {subComponentsRender.dot()}
        <Span
          icss={{
            flexGrow: 1,
            color: colors.ternary,
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          {props.children}
        </Span>
        {subComponentsRender.arrow()}
      </Row>
    </Link>
  )
}
