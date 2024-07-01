import { type Subscribable } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Grid,
  Group,
  Icon,
  Input,
  InputController,
  List,
  SchemaParser,
  SchemaParserController,
  Section,
  createDisclosure,
  createIDBStoreManager,
  createInputDescription,
  createRef,
  icssGrid,
  useKitProps,
  type KitProps,
} from "@edsolater/pivkit"
import { createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import { createStore, reconcile, unwrap, type SetStoreFunction } from "solid-js/store"
import { DraggablePanel, FloatingPanel } from "../pageComponents/FABPanel"
import { ScheduleItem } from "../pageComponents/scheduleItem/ScheduleItem"
import { ScheduleLinkItem } from "../pageComponents/scheduleItem/type"
import { dailyScheduleData, dailySchemaUtils, updateExistedScheduleItem } from "../pageComponents/scheduleItem/utils"
import { downloadJSON, importJSONFile } from "../utils/download"
import { popupWidget } from "../pageComponents/scheduleItem/popupWidget"

export default function DailySchedulePage() {
  const [data, setData] = useSubscribableStore(dailyScheduleData, { name: "daily-schedule", cachedByIndexDB: true })

  const [ref, setRef] = createRef<LinkCreatorFormController>()

  const [canEdit, { toggle: toggleCreatorForm }] = createDisclosure(true)

  function handleDeleteLink(link: ScheduleLinkItem) {
    dailySchemaUtils.deleteLink(link)
  }
  function handleEdit(link: ScheduleLinkItem) {
    ref()?.injectLinkToEdit(link)
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
        <Box class="toolbar" icss={{ display: "flex", width: "100%" }}>
          <Group class="temp-actions" icss={{ flexGrow: 1, display: "flex", gap: "8px" }}>
            <Button
              onClick={() => {
                toggleCreatorForm()
              }}
              plugin={popupWidget.config({
                canBackdropClose: true,
                defaultOpen: true,
                isWrapperAddProps: true,
                popElement: () => (
                  <DraggablePanel icss={{ padding: "32px 16px 4px" }}>
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
                  </DraggablePanel>
                ),
              })}
            >
              <Icon src="/icons/add.svg" icss={{ display: "inline" }} /> Create New
            </Button>
          </Group>
          <Group class="form-actions" icss={{ flexGrow: 1, display: "flex", gap: "8px" }}>
            <Button
              onClick={() => {
                downloadJSON(data, "daily-schedule.json")
                console.log("need to export data to a file")
              }}
            >
              Export
            </Button>
            <Button
              onClick={() => {
                importJSONFile().then((jsonData) => {
                  dailyScheduleData.set(jsonData)
                })
              }}
            >
              Import
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
            <ScheduleItem
              item={link}
              onDelete={() => handleDeleteLink(link)}
              onEdit={() => handleEdit(link)}
              onCategoryChange={(category) => {
                updateExistedScheduleItem(link.id, { category })
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

function Test() {
  const [ref, setRef] = createRef<InputController>()
  const reset = () => {
    ref()?.setText(undefined)
  }
  return <Input onClick={() => reset()} controllerRef={setRef} />
}

//TODO: move to pivkit
/**
 * useful for subscribe to a subscribable
 * @param subscribable
 * @returns
 */
export function useSubscribable<T>(subscribable: Subscribable<T>): [Accessor<T>, Setter<T>] {
  const [value, setValue] = createSignal(subscribable())
  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(setValue)
    onCleanup(unsubscribe)
  })
  createEffect(
    on(
      value,
      () => {
        subscribable.set(value)
      },
      { defer: true },
    ),
  )
  return [value, setValue]
}

//TODO: move to pivkit
/**
 * useful for subscribe to a subscribable
 * @param subscribable
 * @returns
 */
function useSubscribableStore<T extends object>(
  subscribable: Subscribable<T>,
  options?: { cachedByIndexDB?: boolean; name?: string },
): [T, SetStoreFunction<T>] {
  const [store, setStore] = createStore(subscribable())

  const wrappedSet = (...args) => {
    // @ts-expect-error
    const result = setStore(...args)
    console.log("set to subscribable: ", unwrap(store))
    subscribable.set({ ...unwrap(store) })
    return result
  }

  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(
      (s) => {
        if (s != unwrap(store)) {
          return setStore(reconcile(s))
        }
      },
      { immediately: false },
    )
    onCleanup(unsubscribe)
  })

  // ---------------- indexedDB ----------------
  if (options?.cachedByIndexDB) {
    const idbManager = createIDBStoreManager<T>({
      dbName: options.name ?? "default",
      onStoreLoaded: async ({ get }) => {
        const valueStore = await get("store")
        if (valueStore) {
          console.log("on idb connected: valueStore: ", subscribable())
          subscribable.set(valueStore)
        }
      },
    })
    onMount(() => {
      const { unsubscribe } = subscribable.subscribe(
        (value) => {
          console.log("🎉subscribe and set to indexedDB: ", value)
          if (Object.keys(value).length) {
            idbManager.set("store", value)
          }
        },
        { immediately: false },
      )
      onCleanup(unsubscribe)
    })
  }

  return [store, wrappedSet]
}
