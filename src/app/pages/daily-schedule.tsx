import { createSubscribable, type ID, type Subscribable } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Grid,
  Input,
  Item,
  Row,
  Text,
  createInputDescription,
  icssGrid,
  useFormSchema,
} from "@edsolater/pivkit"
import { For, Show, createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import { createStore, unwrap, type SetStoreFunction } from "solid-js/store"
import { createIDBStoreManager } from "../../packages/cacheManager/storageManagers"
import { Link } from "../components/Link"
import { downloadJSON, importJSONFile } from "../utils/download"

type LinkItem = {
  id: ID
  name: string
  url: string
}

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

  const inputFormSchema = {
    name: { formWidget: "input" },
  }

  return (
    <Grid
      icss={icssGrid({
        gap: "32px",
        placeContent: "center",
        placeItems: "center",
        templateColumn: "1fr 1fr",
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

      <Box>
        <Show when={data.links}>
          <For each={data.links}>
            {(link) => <RecordedLinkItem link={link} onDelete={() => handleDeleteLink(link)} />}
          </For>
        </Show>
      </Box>

      <NewLinkItemForm
        onSubmit={({ name, url }) => {
          setData((prev) => ({
            links: [...(prev.links ?? []), { id: name, name, url }],
          }))
        }}
      />
    </Grid>
  )
}

function RecordedLinkItem(props: { link: LinkItem; onDelete?: () => void }) {
  function handleDelete() {
    props.onDelete?.()
  }

  return (
    <Row>
      <Link href={props.link.url}>{props.link.name}</Link>
      <Button size={"sm"} onClick={handleDelete}>
        🔥
      </Button>
    </Row>
  )
}

function NewLinkItemForm(props: { onSubmit?: (link: { name: string; url: string }) => void }) {
  const [name, setName] = createSignal<string | undefined>()
  const [url, setUrl] = createSignal<string | undefined>()
  function handleSubmit() {
    if (name() && url()) {
      props.onSubmit?.({ name: name()!, url: url()! })
      setName(undefined)
      setUrl(undefined)
    }
  }
  const { schemaParsedElement, schemaData } = useFormSchema(
    { name: createInputDescription(), url: createInputDescription() },
    {
      onDataChange({ newSchema }) {
        console.log("newSchema: ", newSchema)
      },
    },
  )
  return (
    <Row>
      {schemaParsedElement}
      <Button onClick={handleSubmit}>Add</Button>
    </Row>
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
          console.log("🎉subscribe and set to indexedDB: ", value) // FIXME why render 4 times🤔🤔🤔
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
