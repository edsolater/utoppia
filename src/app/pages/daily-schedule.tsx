import { createSubscribable, type ID, type Subscribable } from "@edsolater/fnkit"
import { Box, Button, Input, Row, Text } from "@edsolater/pivkit"
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

  return (
    <Box>
      <Box>
        <Show when={data.links}>
          <For each={data.links}>
            {(link) => <RecordedLinkItem link={link} onDelete={() => handleDeleteLink(link)} />}
          </For>
        </Show>
      </Box>

      <NewLinkInputBox
        onSubmit={({ name, url }) => {
          setData((prev) => ({
            links: [...(prev.links ?? []), { id: name, name, url }],
          }))
        }}
      />

      <Box>
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
      </Box>
    </Box>
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

function NewLinkInputBox(props: { onSubmit?: (link: { name: string; url: string }) => void }) {
  const [name, setName] = createSignal<string | undefined>()
  const [url, setUrl] = createSignal<string | undefined>()
  function handleSubmit() {
    if (name() && url()) {
      props.onSubmit?.({ name: name()!, url: url()! })
      setName(undefined)
      setUrl(undefined)
    }
  }
  return (
    <Row>
      <Row>
        <Text>name:</Text>
        <Input
          onInput={(v) => {
            setName(v)
          }}
          value={name}
        ></Input>
      </Row>

      <Row>
        <Text>url:</Text>
        <Input
          onInput={(v) => {
            setUrl(v)
          }}
          value={url}
        ></Input>
      </Row>

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
    console.log("23: ", 23)
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
          console.log("on idb connected: valueStore: ", Reflect.ownKeys(valueStore), subscribable())
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
