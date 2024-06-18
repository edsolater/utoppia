import {
  Accessify,
  Box,
  Icon,
  KitProps,
  List,
  Piv,
  Row,
  cssOpacity,
  cssVar,
  icssCol,
  useKitProps,
} from "@edsolater/pivkit"
import { useLocation } from "@solidjs/router"
import { Show, createMemo, createSelector } from "solid-js"
import { routes } from "../../routes/routes"
import { Link } from "../../components/Link"
import { colors } from "../../theme/colors"

export function NavRouteItems() {
  const location = useLocation()
  const pathnameSelector = createSelector(() => location.pathname)
  return (
    <List
      renderWrapper={Piv}
      items={routes}
      icss={[
        icssCol(),
        {
          display: "flex",
          flexDirection: "column",
          gap: ".25rem",
          overflowY: "auto",
          paddingBlock: "1rem",
          paddingInline: "0.5rem",
          marginInlineEnd: "0.5rem",
          marginBlockEnd: "0.5rem",
        },
      ]}
    >
      {(route) => (
        <Show when={!route.isHiddenLink}>
          <LinkItem
            icss={{ textTransform: "capitalize" }}
            icon={route.icon}
            href={route.path}
            isCurrentRoutePath={pathnameSelector(route.path)}
          >
            {route.name}
          </LinkItem>
        </Show>
      )}
    </List>
  )
}
type LinkItemProps = {
  href?: string
  icon?: string
  isCurrentRoutePath?: boolean
  children?: Accessify<string>
}
function LinkItem(kitProps: KitProps<LinkItemProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const isInnerLink = createMemo(() => props.href?.startsWith("/"))
  const isExternalLink = () => !isInnerLink
  return (
    <Link
      href={props.href}
      innerRoute={isInnerLink}
      shadowProps={shadowProps}
      icss={{
        display: "block",
        paddingBlock: "0.5rem",
        paddingInline: "1rem",
        borderRadius: "0.5rem",
        transition: "150ms",
        background: props.isCurrentRoutePath ? cssOpacity(colors.secondary, 0.2) : "transparent",
        "&:hover": {
          background: cssOpacity(colors.secondary, 0.2),
        },
      }}
    >
      <Row>
        <Box
          icss={{
            display: "grid",
            bg: `linear-gradient(135deg, ${cssOpacity(colors.textSecondary, 0.2)}, transparent)`,
            borderRadius: "0.5rem",
            padding: "0.375rem",
            marginRight: "0.75rem",
          }}
        >
          <Icon size={"sm"} src={props.icon} />
        </Box>
        <Row
          icss={{
            flexGrow: 1,
            justifyContent: "space-between",
            color: colors.textSecondary,
            transition: "80ms",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          <Piv icss={{ marginBlock: "auto" }}>{props.children}</Piv>
          {isExternalLink() && <Icon icss={{ display: "inline", opacity: ".8" }} size={"sm"} />}
        </Row>
      </Row>
    </Link>
  )
}
