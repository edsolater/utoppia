import { shrinkFn, type Collection, type GetCollectionValue, type MayFn } from "@edsolater/fnkit"
import type { ICSSObject } from "@edsolater/pivkit"
import {
  Box,
  Col,
  CollapseBox,
  Group,
  ICSS,
  Icon,
  InfiniteScrollList,
  Loop,
  Row,
  Text,
  Title,
  createICSS,
  icssCenterY,
  icssClickable,
  icssThreeSlotGrid,
  parseICSSToClassName,
  useElementResize,
  useKitProps,
  type InfiniteScrollListKitProps,
  type KitProps,
  type PivChild
} from "@edsolater/pivkit"
import { createContext, createMemo, createSignal, useContext, type Accessor } from "solid-js"
import { colors } from "../../../app/theme/colors"
import { scrollbarWidth } from "../../../app/theme/misc"
import { CyberPanel } from "../CyberPanel"

// for sort and search
export type TabelHeaderConfigs<T extends Collection> = {
  name: string
}[]

type DatabaseTableProps<T extends Collection> = {
  items: T
  propForList?: InfiniteScrollListKitProps<GetCollectionValue<T>>
  // essiential for collection/favorite system
  getKey: (item: GetCollectionValue<T>) => string
  // config for sort
  headerConfig: TabelHeaderConfigs<GetCollectionValue<T>>
  itemRowConfig?: DatabaseTabelItemRenderConfig<GetCollectionValue<T>>
  itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<GetCollectionValue<T>>
  itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<GetCollectionValue<T>>
  title: string
  subtitle?: string
  subtitleDescription?: string

  SubtitleActions?: PivChild
  TopMiddle?: PivChild
  TopRight?: PivChild
  // TableBodyTopLeft?: PivChild
  TableBodyTopMiddle?: PivChild
  TableBodyTopRight?: PivChild
  onClickItem?: (item: GetCollectionValue<T>) => void
}

type RowWidths = number[]

interface DatabaseTabelContextValue {
  databaseTableGridTemplate?: Accessor<ICSS>
  setItemPiecesWidth: (key: string, idx: number, width: number) => void
}

const DatabaseTableContext = createContext<DatabaseTabelContextValue>(
  { setItemPiecesWidth: (key: string, idx: number, width: number) => {} },
  { name: "ListController" },
)

/**
 * main page components
 *
 *
 * show a list of items in CyberPanel
 */
export function DatabaseTable<T extends Collection>(
  kitProps: KitProps<DatabaseTableProps<T>, { noNeedDeAccessifyProps: ["getKey"] }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: "DatabaseTable",
    noNeedDeAccessifyProps: ["getItemKey"],
  })
  const cellNames = () => props.headerConfig.map((config) => config.name)
  const [cellWidths, setItemWidthRecord] = createSignal<Record<string, RowWidths>>({})
  const cellMaxWidths = createMemo(
    () => {
      const record = cellWidths()
      const maxRecord: number[] = []
      for (const key in record) {
        const widths = record[key]
        widths.forEach((width, idx) => {
          maxRecord[idx] = maxRecord[idx] ? Math.max(maxRecord[idx], width) : width
        })
      }
      return maxRecord
    },
    [],
    { equals: (prev, next) => prev.length === next.length && prev.every((v, idx) => v === next[idx]) },
  )

  const databaseTableGridICSS = () =>
    icssTableRow({
      itemWidths: cellMaxWidths(),
      childrenIcss: {
        transition: "150ms",
      },
    })

  const headerICSS = () => [
    // TODO: should also in createICSS
    { "& > *": { paddingInline: "8px" } },
    databaseTableGridICSS(),
  ]
  const databaseTableContextRoot: DatabaseTabelContextValue = {
    databaseTableGridTemplate: databaseTableGridICSS,
    setItemPiecesWidth: (key, index, width) => {
      setItemWidthRecord((record) => {
        const widths = record[key] ?? []
        widths[index] = width
        return { ...record, [key]: widths }
      })
    },
  }
  return (
    <DatabaseTableContext.Provider value={databaseTableContextRoot}>
      <Col icss={{ maxHeight: "100%", overflowY: "hidden" }} shadowProps={shadowProps}>
        <Box icss={icssThreeSlotGrid}>
          <Title icss={{ color: colors.textPrimary }}>{props.title}</Title>
          <Box>{props.TopMiddle}</Box>
          <Box>{props.TopRight}</Box>
        </Box>
        <CyberPanel icss={{ overflow: "hidden", paddingInline: "24px" }}>
          <Box icss={icssThreeSlotGrid}>
            <Box>
              <Title>{props.subtitle}</Title>
              <Text>{props.subtitleDescription}</Text>
            </Box>
            <Box>{props.TableBodyTopMiddle}</Box>
            <Box>{props.TableBodyTopRight}</Box>
          </Box>

          <Group
            name="table-header"
            icss={{
              display: "flex",
              paddingInline: "16px",
              paddingBlock: "8px",
              borderRadius: "12px",
              background: colors.listHeader,
            }}
          >
            {/* collect star */}
            <Box icss={{ width: "32px" }}></Box>

            <Box icss={[{ flexGrow: 1 }, headerICSS()]}>
              <Loop items={cellNames}>
                {(headerLabel) => <Text icss={{ fontWeight: "bold", color: colors.textSecondary }}>{headerLabel}</Text>}
              </Loop>
            </Box>
          </Group>

          <Group name="items">
            <InfiniteScrollList // FIXME why can't be <Loop> ? 🤔
              shadowProps={props.propForList}
              items={props.items as Collection}
              icss={{
                maxHeight: "100%",
                overflowY: "scroll",
                overflowX: "hidden",
                marginRight: `-${scrollbarWidth}px`,
              }}
            >
              {(item: any) => (
                <DatabaseTableItem
                  item={item}
                  key={kitProps.getKey(item)}
                  headerConfig={props.headerConfig}
                  itemRowConfig={props.itemRowConfig}
                  itemFaceConfig={props.itemFaceConfig}
                  itemContentConfig={props.itemContentConfig}
                  onClickItem={props.onClickItem}
                />
              )}
            </InfiniteScrollList>
          </Group>
        </CyberPanel>
      </Col>
    </DatabaseTableContext.Provider>
  )
}

type DatabaseTabelItemRenderConfig<T> = {
  collapseTransitionDuration?: number | ((item: T) => number)
}

const icssClmmItemRow = parseICSSToClassName({ paddingBlock: "4px" })
const icssClmmItemRowCollapse = parseICSSToClassName({
  borderRadius: "20px",
  overflow: "hidden",
})

/**
 * components to show clmm info
 */
function DatabaseTableItem<T>(props: {
  key: string
  item: T
  headerConfig: TabelHeaderConfigs<any>
  itemRowConfig?: DatabaseTabelItemRenderConfig<T>
  itemFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<any>
  itemContentConfig: DatabaseTabelItemCollapseContentRenderConfig<any>
  onClickItem?: (item: T) => void
}) {
  return (
    <Box icss={icssClmmItemRow} class="ClmmItemRow">
      <CollapseBox
        icss={icssClmmItemRowCollapse}
        optionsOfCSSCollapse={{
          durationMs: shrinkFn(props.itemRowConfig?.collapseTransitionDuration, [props.item]),
        }}
        renderFace={() => (
          <DatabaseTableItemCollapseFace key={props.key} item={props.item} innerConfig={props.itemFaceConfig} />
        )}
        renderContent={() => (
          <DatabaseTableItemCollapseContent item={props.item} innerConfig={props.itemContentConfig} />
        )}
        onClick={() => props.onClickItem?.(props.item)}
      />
    </Box>
  )
}

const databaseTableRowCollapseFaceStyle = parseICSSToClassName([
  {
    paddingBlock: "20px",
    paddingInline: "16px",
    background: colors.listItem,
    transition: "all 150ms",
  },
])

export type DatabaseTabelItemCollapseFaceRenderConfig<T> = {
  name: string
  render: (item: T, idx: Accessor<number>) => PivChild
}[]

function DatabaseTableItemCollapseFace<T>(
  kitProps: KitProps<{ key: string; item: T; innerConfig: DatabaseTabelItemCollapseFaceRenderConfig<T> }>,
) {
  // console.count('DatabaseTableItemCollapseFace') // TODO: why render so many times
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseTableItemCollapseFace" })
  const { databaseTableGridTemplate, setItemPiecesWidth } = useContext(DatabaseTableContext)
  return (
    <Row shadowProps={shadowProps} icss={[icssCenterY, databaseTableRowCollapseFaceStyle]}>
      <Box icss={{ width: "24px", marginRight: "8px" }}>
        <ItemStarIcon />
      </Box>

      <Group name="item-parts" icss={[{ flex: 1 }, databaseTableGridTemplate?.()]}>
        <Loop items={props.innerConfig}>
          {(config, idx) => (
            <DatabaseItemFacePartTextDetail
              name={config.name}
              value={config.render(props.item, idx)}
              onResize={({ entry, el }) => {
                setItemPiecesWidth(props.key, idx(), entry.contentRect.width)
              }}
            />
          )}
        </Loop>
      </Group>
    </Row>
  )
}

const databaseItemFacePartTextDetailInnerStyle = parseICSSToClassName({ width: "fit-content" })

function DatabaseItemFacePartTextDetail(
  kitProps: KitProps<{ onResize?({ entry, el }): void; name: string; value?: any }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseListItemFaceDetailInfoBoard" })
  const { ref: resizeRef } = useElementResize(({ entry, el }) => {
    props.onResize?.({ entry, el })
  })
  return (
    <Box shadowProps={shadowProps}>
      <Box class={"itemInnerBox"} domRef={resizeRef} icss={databaseItemFacePartTextDetailInnerStyle}>
        {props.value || "--"}
      </Box>
    </Box>
  )
}
/**
 * usually used for detecting user favorite/collected
 */
export function ItemStarIcon() {
  const isFavourite = () => false
  return (
    <Box
      icss={{
        width: "24px",
        alignSelf: "center",
      }}
    >
      <Icon
        src={isFavourite() ? "/icons/misc-star-filled.svg" : "/icons/misc-star-empty.svg"}
        onClick={({ ev }) => {
          ev.stopPropagation() // onUnFavorite?.(deAccessify(props.item).ammId)

          // onStartFavorite?.(deAccessify(props.item).ammId)
        }}
        icss={[
          icssClickable,
          {
            margin: "auto",
            alignSelf: "center",
          },
        ]}
      />
    </Box>
  )
}

export type DatabaseTabelItemCollapseContentRenderConfig<T> = {
  render: (item: T) => PivChild
}
const databaseTableItemCollapseContentStyle = parseICSSToClassName({
  background: "linear-gradient(126.6deg, rgba(171, 196, 255, 0.12), rgb(171 196 255 / 4%) 100%)",
})

export function DatabaseTableItemCollapseContent<T>(
  kitProps: KitProps<{ item: T; innerConfig: DatabaseTabelItemCollapseContentRenderConfig<T> }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseTableItemCollapseContent" })
  const isFavourite = () => false
  const renderContent = props.innerConfig.render(props.item)
  return <Box icss={databaseTableItemCollapseContentStyle}>{renderContent}</Box>
}

const icssTableRow = createICSS((options?: { itemWidths?: number[]; childrenIcss?: ICSSObject }) =>
  Object.assign(
    {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      "& > *": { ...options?.childrenIcss, flexGrow: "1" },
    },
    ...(options?.itemWidths?.map((w, idx) => ({ [`& > *:nth-child(${idx + 1})`]: { flexBasis: `${w}px` } })) ?? []),
  ),
)
