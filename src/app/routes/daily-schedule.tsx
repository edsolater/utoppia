import { createSubscribable, type Subscribable } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Grid,
  Input,
  InputController,
  Item,
  List,
  SchemaParser,
  SchemaParserController,
  createInputDescription,
  createRef,
  icssGrid,
  useKitProps,
  type KitProps,
} from "@edsolater/pivkit"
import { createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import { createStore, unwrap, type SetStoreFunction } from "solid-js/store"
import { createIDBStoreManager } from "../../packages/cacheManager/storageManagers"
import { LinkCard } from "../pageComponents/LinkItem/LinkCard"
import { LinkItem } from "../pageComponents/LinkItem/type"
import { downloadJSON, importJSONFile } from "../utils/download"

type ScheduleSchema = {
  links?: LinkItem[]
}

const dailyScheduleData = createSubscribable<ScheduleSchema>({})

export default function DailySchedulePage() {
  const [data, setData] = useSubscribableStore(dailyScheduleData, { cachedByIndexDB: true, name: "daily-schedule" })

  const [ref, setRef] = createRef<LinkCreatorFormController>()
  function handleDeleteLink(link: LinkItem) {
    setData((prev) => ({
      links: prev.links?.filter((l) => l.id !== link.id),
    }))
  }
  function handleEdit(link: LinkItem) {
    ref()?.injectLinkToEdit(link)
  }

  return (
    <Grid
      icss={icssGrid({
        gap: "32px",
        placeContent: "center",
        placeItems: "center",
        templateColumn: "2fr 1fr",
      })}
    >
      <Item icss={{ gridColumn: "1 / -1", display: "flex", gap: "8px" }}>
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
              setData(jsonData)
            })
          }}
        >
          Import
        </Button>
      </Item>

      <List
        items={data.links}
        icss={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
        }}
      >
        {(link) => <LinkCard item={link} onDelete={() => handleDeleteLink(link)} onEdit={() => handleEdit(link)} />}
      </List>

      <LinkCreatorForm
        ref={setRef}
        onDone={({ info: newformData, inEditMode }) => {
          if (inEditMode) {
            setData((prev) => ({
              links: prev.links?.map((link) => link.id === newformData.id ? newformData : link),
            }))
          } else {
            setData((prev) => ({
              links: [...(prev.links ?? []), { id: newformData.name, ...newformData }],
            }))
          }
        }}
      />
    </Grid>
  )
}

type LinkCreatorFormProps = {
  onDone?: (options: { info: any; inEditMode?: boolean }) => void
}
type LinkCreatorFormController = {
  injectLinkToEdit(link: object): void
}

function LinkCreatorForm(kitProps: KitProps<LinkCreatorFormProps>) {
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
    <Box shadowProps={shadowProps}>
      <Box icss={{ marginBottom: "32px" }}>
        <SchemaParser schema={formSchema} ref={setSchemaRef} />
      </Box>
      <Button onClick={handleSubmit}>{isInEditMode() ? "Update" : "Create"}</Button>
      <Button onClick={handleReset}>Reset</Button>
      <Test />
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
function useSubscribable<T>(subscribable: Subscribable<T>): [Accessor<T>, Setter<T>] {
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
          return setStore(s)
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