import { KitProps, Piv, parseICSSToClassName, renderHTMLDOM, useKitProps } from "@edsolater/pivkit"
import { createMemo } from "solid-js"

export interface LinkRawProps {
  href?: string
  boxWrapper?: boolean

  /**
   * @default true/false base on if href is same host
   */
  innerRoute?: boolean
}

export type LinkProps = KitProps<LinkRawProps>

const linkDefaultIcss = () =>
  parseICSSToClassName({
    transition: "150ms",
    cursor: "pointer",
    "&:hover": { textDecoration: "underline" },
  })

/**
 * tag: `<a>` or `<span>`
 */
export function Link(rawProps: LinkProps) {
  // const navigate = useNavigate()
  const { props, shadowProps } = useKitProps(rawProps, { name: "Link" })
  const innerRoute = createMemo(() => props.innerRoute ?? (props.href ? isSameHostUrl(props.href) : false))
  return (
    <Piv<"a">
      icss={linkDefaultIcss}
      defineSelf={(selfProps) =>
        renderHTMLDOM("a", selfProps, {
          href: props.href,
          rel: innerRoute() ? undefined : "nofollow noopener noreferrer",
          target: innerRoute() ? undefined : "_blank",
        })
      }
      shadowProps={shadowProps}
      // onClick={() => props.innerRoute && props.href && navigate(props.href)}
    />
  )
}
function isSameHostUrl(url: string) {
  return url.startsWith(window.location.origin)
}
