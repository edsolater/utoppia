import { Box, KitProps, Row, parseICSSToClassName, useElementResize, useKitProps } from "@edsolater/pivkit"
import {
  DatabaseTable,
  type DatabaseTabelItemCollapseContentRenderConfig,
  type DatabaseTabelItemCollapseFaceRenderConfig,
  type TabelHeaderConfigs,
} from "../components/DatabaseTable"
import { Token } from "../components/TokenProps"
import { createStorePropertySignal } from "../stores/data/store"
import { PairInfo } from "../stores/data/types/pairs"

const databaseItemFacePartTextDetailInnerStyle = parseICSSToClassName({ width: "fit-content" })

export function DatabaseItemFacePartTextDetail(
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

export function DatabaseItemFacePartTokenAvatarLabel(kitProps: KitProps<{ info?: PairInfo }>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DatabaseListItemFaceTokenAvatarLabel" })
  return (
    <Box>
      <Token />
    </Box>
  )
}

export default function PoolsPage() {
  const pairInfos = createStorePropertySignal((s) => s.pairInfos)
  const tabelHeaderConfig: TabelHeaderConfigs<PairInfo> = [
    {
      name: "Pool",
    },
    {
      name: "liquidity",
    },
  ]
  const tabelItemRowFaceConfig: DatabaseTabelItemCollapseFaceRenderConfig<PairInfo> = [
    {
      name: "Pool",
      render: (i) => (
        <Row>
          <DatabaseItemFacePartTokenAvatarLabel info={i} />
        </Row>
      ),
    },
    {
      name: "liquidity",
      render: (i) => <DatabaseItemFacePartTextDetail name="liquidity" value={i.liquidity} />,
    },
  ]
  const tabelItemRowContentConfig: DatabaseTabelItemCollapseContentRenderConfig<PairInfo> = {
    render: (i) => void 0,
  }
  return (
    <DatabaseTable
      title="Pools"
      items={pairInfos}
      getKey={(i) => i.ammId}
      itemContentConfig={tabelItemRowContentConfig}
      itemFaceConfig={tabelItemRowFaceConfig}
      headerConfig={tabelHeaderConfig}
    />
  )
}
