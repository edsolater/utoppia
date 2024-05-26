import { Box, Button, Group } from "@edsolater/pivkit"
import { Link } from "../components/Link"
import { createSubscribable, type Subscribable } from "@edsolater/fnkit"
import { type Accessor, type Setter, createSignal, createEffect, onCleanup, For } from "solid-js"
import { createStore, type SetStoreFunction } from "solid-js/store"
import { downloadJSON, importJSONFile } from "../utils/download"

const dailyScheduleData = createSubscribable({
  links: [
    {
      name: "光速观察站",
      url: "https://space.bilibili.com/383354609",
    },
  ],
})
export default function DailySchedulePage() {
  const [data, setData] = useSubscribableStore(dailyScheduleData)
  return (
    <Box>
      <Box>
        <For each={data.links}>{(link) => <Link href={link.url}>{link.name}</Link>}</For>
      </Box>

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
              console.log("parsed jsonData: ", jsonData)
            })
          }}
        >
          Import
        </Button>
      </Box>
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
  return [value, setValue]
}

//TODO: move to pivkit
/**
 * useful for subscribe to a subscribable
 * @param subscribable
 * @returns
 */
function useSubscribableStore<T extends object>(subscribable: Subscribable<T>): [T, SetStoreFunction<T>] {
  const [store, setStore] = createStore(subscribable())
  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(setStore)
    onCleanup(unsubscribe)
  })
  return [store, setStore]
}
