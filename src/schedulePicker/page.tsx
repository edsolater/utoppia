import {
  Box,
  Button,
  Grid,
  Group,
  Icon,
  List,
  SchemaParser,
  SchemaParserController,
  Section,
  Space,
  createInputDescription,
  createRef,
  icssGrid,
  useKitProps,
  useSubscribableStore,
  withPopupWidget,
  type KitProps,
} from "@edsolater/pivkit"
import { createSignal } from "solid-js"
import { DraggablePanel } from "../app/components/FABPanel"
import { ScheduleItemCard } from "./pageComponents/scheduleItem/ScheduleItem"
import type { ScheduleLinkItem } from "./pageComponents/scheduleItem/type"
import {
  createNewLinkScheduleItem,
  dailyScheduleData,
  deleteLinkScheduleItem,
  updateExistedScheduleItem,
} from "./pageComponents/scheduleItem/utils"
import { downloadJSON, importJSONFile } from "./utils/download"

export default function DailySchedulePage() {
  const [data, setData] = useSubscribableStore(dailyScheduleData, { canCachedByIndexDB: true })

  const [linkCreatorFormRef, setLinkCreatorRef] = createRef<LinkCreatorFormController>()

  function handleDeleteLink(link: ScheduleLinkItem) {
    deleteLinkScheduleItem(link)
  }
  function handleEdit(link: ScheduleLinkItem) {
    linkCreatorFormRef()?.injectLinkToEdit(link)
  }

  return (
    <Grid
      icss={[
        icssGrid({
          gap: "32px",
          templateColumn: "2fr 1fr",
        }),
        {
          display: "grid",
          transition: "grid-template 0.5s",
          gridTemplate: `
            "toolbar toolbar" auto
            "main    main   " 1fr / 1fr 300px
          `,
        },
      ]}
    >
      <Section icss={{ gridArea: "toolbar" }}>
        <Box class="toolbar" icss={{ display: "flex", width: "100%", gap: "32px" }}>
          <Space />
          <Group class="temp-actions" icss={{ display: "flex", gap: "8px" }}></Group>
          <Group class="form-actions" icss={{ display: "flex", gap: "8px" }}>
            <Button>
              <Icon src="/icons/settings.svg" variant="inline" />
            </Button>
            <Button
              onClick={() => {
                createNewLinkScheduleItem()
              }}
            >
              <Icon src="/icons/add.svg" variant="inline" /> Create New
            </Button>
            <Button
              onClick={() => {
                downloadJSON(data, "daily-schedule.json")
              }}
            >
              <Icon src="/icons/download_2.svg" variant="inline" />
              Download Profile Settings
            </Button>
            <Button
              onClick={() => {
                importJSONFile().then((jsonData) => {
                  dailyScheduleData.set(jsonData)
                })
              }}
            >
              <Icon src="/icons/upload_2.svg" variant="inline" />
              Load Profile Settings
            </Button>
          </Group>
        </Box>
      </Section>

      <Group icss={{ gridArea: "main" }}>
        <List
          items={data.links}
          icss={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {(link) => (
            <ScheduleItemCard
              item={link}
              onDelete={() => handleDeleteLink(link)}
              onEdit={() => handleEdit(link)}
              onItemInfoChange={(itemInfo) => {
                updateExistedScheduleItem(link.id, itemInfo)
              }}
            />
          )}
        </List>
      </Group>

      {/* <FloatingPanel open={canEdit} defaultOpen>
        <NewScheduleItemCreatorForm
          ref={setRef}
          onDone={({ info: newformData, inEditMode }) => {
            if (inEditMode) {
              setData((prev) => ({
                links: prev.links?.map((link) => (link.id === newformData.id ? newformData : link)),
              }))
            } else {
              setData((prev) => ({
                links: [...(prev.links ?? []), { id: newformData.name, ...newformData }],
              }))
            }
          }}
        />
      </FloatingPanel> */}
    </Grid>
  )
}

/**
 * user can create new ScheduleItem by click the button
 * @deprecated just template
 */
function Deprecated_PopoverFormCreatorButton(
  kitprops: KitProps<{
    refOfNewScheduleItemCreatorForm: (cl: LinkCreatorFormController) => void
    onSubmit?: (newformData: any, inEditMode: boolean) => void
  }>,
) {
  const { props, shadowProps } = useKitProps(kitprops, { name: "CreatorButton" })
  return (
    <Button
      shadowProps={shadowProps}
      plugin={withPopupWidget.config({
        popoverMode: true,
        isWrapperAddProps: true,
        popElement: () => (
          <DraggablePanel icss={{ padding: "32px 16px 4px" }}>
            <NewScheduleItemCreatorForm
              ref={props.refOfNewScheduleItemCreatorForm}
              onDone={({ info: newformData, inEditMode }) => {
                props.onSubmit?.(newformData, Boolean(inEditMode))
              }}
            />
          </DraggablePanel>
        ),
      })}
    >
      <Icon src="/icons/add.svg" variant="inline" /> Create New
    </Button>
  )
}

type LinkCreatorFormProps = {
  onDone?: (options: { info: any; inEditMode?: boolean }) => void
}
type LinkCreatorFormController = {
  injectLinkToEdit(link: object): void
}

function NewScheduleItemCreatorForm(kitProps: KitProps<LinkCreatorFormProps>) {
  const { props, shadowProps, loadController } = useKitProps(kitProps, { name: "LinkCreatorForm" })
  const formSchema = {
    name: createInputDescription(),
    url: createInputDescription(),
    tag: createInputDescription(),
    comment: createInputDescription(),
  }
  const [isInEditMode, setIsInEditMode] = createSignal(false)
  const [schemaRef, setSchemaRef] = createRef<SchemaParserController<typeof formSchema>>()
  const controller: LinkCreatorFormController = {
    injectLinkToEdit(info: object) {
      schemaRef()?.setData(info)
      setIsInEditMode(true)
    },
  }
  loadController(controller)

  // submit action
  function handleSubmit() {
    if (schemaRef()?.canSubmit()) {
      props.onDone?.({ inEditMode: isInEditMode(), info: schemaRef()?.schemaData() as any })
      schemaRef()?.reset()
      setIsInEditMode(false)
    }
  }

  function handleReset() {
    schemaRef()?.reset()
    setIsInEditMode(false)
  }

  return (
    <Box shadowProps={shadowProps} icss={{ width: "300px", height: "300px" }}>
      <Group icss={{ marginBottom: "32px" }}>
        <SchemaParser schema={formSchema} ref={setSchemaRef} />
      </Group>
      <Group name="button-group" icss={{ display: "flex", gap: "4px" }}>
        <Button onClick={handleSubmit}>{isInEditMode() ? "Update" : "Create"}</Button>
        <Button onClick={handleReset}>Reset</Button>
      </Group>
    </Box>
  )
}
