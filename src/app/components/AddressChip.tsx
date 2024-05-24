import { AnyFn, createInvoker } from "@edsolater/fnkit"
import {
  IconProps,
  ItemBoxProps,
  KitProps,
  PivProps,
  copyToClipboard,
  createDisclosure,
  useKitProps,
} from "@edsolater/pivkit"
import { createEffect } from "solid-js"

export type AddressItemProps = ItemBoxProps &
  KitProps<{
    publicKey: string
    showDigitCount?: number | "all"
    addressType?: "token" | "account"

    canCopy?: boolean
    showCopyIcon?: boolean
    canExternalLink?: boolean
    /** default sm */
    iconSize?: "xs" | "sm" | "smi" | "md" | "lg"
    iconSrc?: IconProps["src"]
    iconProps?: IconProps
    iconRowProps?: PivProps
    onCopied?(text: string): void // TODO: imply it
  }>
/**
 * base on {@link RowItem}
 * @todo it should be a props:plugin
 */
export function AddressChip(kitProps: AddressItemProps) {
  const { props } = useKitProps(kitProps, {
    defaultProps: {
      iconSize: "sm",
    },
  })

  const [isCopied, { close: delayOffCopyState, open: turnOnCopyState }] = createDisclosure(false, { delay: 400 })

  createEffect(() => {
    if (isCopied()) delayOffCopyState()
  })

  const handleClickCopy = (ev: { stopPropagation: AnyFn }) => {
    ev.stopPropagation()
    if (!isCopied)
      copyToClipboard(props.publicKey)
        .then(createInvoker(turnOnCopyState))
        .then(() => props.onCopied?.(props.publicKey))
  }

  return null

  // const externalSuffix = (
  //   <Piv icss={{ gap: 4, marginLeft: 12 }} shadowProps={props.iconRowProps}>
  //     {props.showCopyIcon ? (
  //       <Icon
  //       size={props.iconSize}
  //       shadowProps={props.iconProps}
  //       // className={twMerge('clickable text-[#ABC4FF]', iconClassName)}
  //       // heroIconName='clipboard-copy'
  //       src='https://img.icons8.com/material-rounded/24/null/new-by-copy.png'
  //       onClick={({ ev }) => handleClickCopy(ev)}
  //       />
  //       ) : null}
  //     {props.canExternalLink ? (
  //       <LinkExplorer hrefDetail={`${publicKey}`} type={addressType}>
  //         <Icon
  //           size={iconSize}
  //           heroIconName='external-link'
  //           className={twMerge('clickable text-[#ABC4FF]', iconClassName)}
  //           />
  //       </LinkExplorer>
  //     ) : null}
  //   </Piv>
  // )

  // return (
  //   <RowItem shadowProps={props} suffix={props.canCopy || props.canExternalLink ? externalSuffix : null}>
  //     <div title={toPubString(publicKey)} className='relative' onClick={(ev) => canCopy && handleClickCopy(ev)}>
  //       <div className={`${isCopied ? 'opacity-10' : 'opacity-100'} transition`}>
  //         {showDigitCount === 'all'
  //           ? `${toPubString(publicKey)}`
  //           : `${toPubString(publicKey).slice(0, showDigitCount)}...${toPubString(publicKey).slice(
  //               -1 * showDigitCount
  //             )}`}
  //       </div>
  //       <div
  //         className={`absolute inset-0 ${
  //           isCopied ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  //         } transition flex items-center justify-center`}
  //       >
  //         Copied
  //       </div>
  //     </div>
  //   </RowItem>
  // )
}
