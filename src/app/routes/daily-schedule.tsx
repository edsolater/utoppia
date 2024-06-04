import { createSubscribable, type Subscribable } from "@edsolater/fnkit"
import { Box, Button, Grid, Item, List, createInputDescription, icssGrid, useFormSchema } from "@edsolater/pivkit"
import { For, Show, createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import { createStore, unwrap, type SetStoreFunction } from "solid-js/store"
import { createIDBStoreManager } from "../../packages/cacheManager/storageManagers"
import { LinkItemInfo } from "../pageComponents/LinkItem/LinkRecordedItem"
import { downloadJSON, importJSONFile } from "../utils/download"
import { LinkItem } from "../pageComponents/LinkItem/type"

type ScheduleSchema = {
  links?: LinkItem[]
}

const dailyScheduleData = createSubscribable<ScheduleSchema>({})

export default function DailySchedulePage() {
  const [data, setData] = useSubscribableStore(dailyScheduleData, { cachedByIndexDB: true, name: "daily-schedule" })

  function handleDeleteLink(link: LinkItem) {
    setData((prev) => ({
      links: prev.links?.filter((l) => l.id !== link.id),
    }))
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
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: "16px",
        }}
      >
        {(link) => <LinkItemInfo item={link} onDelete={() => handleDeleteLink(link)} />}
      </List>

      <LinkCreatorForm
        onSubmit={(newformData: any) => {
          setData((prev) => ({
            links: [...(prev.links ?? []), { id: newformData.name, ...newformData }],
          }))
        }}
      />
    </Grid>
  )
}

function LinkCreatorForm(props: { onSubmit?: (info: object) => void }) {
  const formSchema = {
    name: createInputDescription(),
    url: createInputDescription(),
    tag: createInputDescription(),
    comment: createInputDescription(),
  }

  const { schemaParsedElement, schemaData, reset, canSubmit } = useFormSchema(formSchema)

  // submit action
  function handleSubmit() {
    if (canSubmit()) {
      props.onSubmit?.(schemaData() as any)
      reset()
    }
  }

  return (
    <Box>
      <Box icss={{ marginBottom: "32px" }}>{schemaParsedElement}</Box>
      <Button onClick={handleSubmit}>Submit</Button>
      <Button onClick={reset}>Reset</Button>
    </Box>
  )
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
    subscribable.set(unwrap(store))
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

  //  alse use indexedDB
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
