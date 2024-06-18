import { MayPromise, createInvoker, switchCase } from "@edsolater/fnkit"
import {
  AddProps,
  Box,
  Button,
  CollapseBox,
  Drawer,
  DrawerController,
  Group,
  InfiniteScrollList,
  Input,
  Modal,
  ModalController,
  Piv,
  Radio,
  RenderFactory,
  Select,
  Switch,
  Tabs,
  Text,
  ValidProps,
  buildPopover,
  createDisclosure,
  createIncresingAccessor,
  createIntervalEffect,
  createPlugin,
  cssLinearGradient,
  cssOpacity,
  cssRadialGradient,
  cssRepeatingLinearGradient,
  draggablePlugin,
  droppablePlugin,
  icssCardPanel,
  icssCenter,
  icssCol,
  icssGrid,
  icssRow,
  itemSortablePlugin,
  loadModuleAutoSizeTransition,
  loadModuleCSSCollapse,
  loadModuleTransition,
  renderSwitchThumb,
  useControllerByID,
  useHoverPlugin,
  useKitProps,
  type ICSS,
} from "@edsolater/pivkit"
import { Accessor, JSXElement, createContext, createEffect, createSignal, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { ExamplePanel } from "../components/ExamplePanel"
import { RefreshCircle } from "../components/RefreshCircle"
import { ViewTransitionSliderBox } from "../components/ViewTransitionSliderBox"
import { FloatingInfoPanel } from "../pageComponents/FABPanel"
import { colors } from "../theme/colors"

export default function PlaygroundPage() {
  return (
    <Piv>
      <ComponentSpecList />
    </Piv>
  )
}

function ComponentSpecList() {
  return (
    <Box
      icss={{
        display: "grid",
        gridTemplateColumns: "repeat(1, minmax(400px, 1fr))",
        padding: "32px",
        gap: "4vw",
      }}
    >
      <ExamplePanel name="Drap and Drop">
        <DragAndDropExample />
      </ExamplePanel>

      <ExamplePanel name="Temporary">
        <TemporaryExample />
      </ExamplePanel>

      <ExamplePanel name="Float panel example">
        <FloatPanelExample />
      </ExamplePanel>

      <ExamplePanel name="Drawer">
        <DrawerExample />
      </ExamplePanel>

      <ExamplePanel name="Modal">
        <ModalExample />
      </ExamplePanel>

      <ExamplePanel name="IntervalCircle">
        <CircularProgressExample />
      </ExamplePanel>

      <ExamplePanel name="Collapse">
        <CSSCollapseExample />
      </ExamplePanel>

      <ExamplePanel name="CollapseComponent">
        <CSSCollapseComponentExample />
      </ExamplePanel>

      <ExamplePanel name="Input">
        <InputExample />
      </ExamplePanel>

      <ExamplePanel name="Text">
        <TextExample />
      </ExamplePanel>

      <ExamplePanel name="List">
        <ListExample />
      </ExamplePanel>

      <ExamplePanel name="Switch">
        <SwitchExample />
      </ExamplePanel>

      <ExamplePanel name="Radio">
        <RadioExample />
      </ExamplePanel>

      <ExamplePanel name="ViewTransitionSliderBox">
        <ViewTransitionSliderBoxExample />
      </ExamplePanel>

      <ExamplePanel name="Popover">
        <PopoverExample />
      </ExamplePanel>

      <ExamplePanel name="ComponentFactory">
        <ComponentFactoryExample />
      </ExamplePanel>

      <ExamplePanel name="upload">
        <UploadExample />
      </ExamplePanel>

      <ExamplePanel name="Tabs">
        <TabsExample />
      </ExamplePanel>

      <ExamplePanel name="PropContext + ControllerContext">
        <PropContextExample />
      </ExamplePanel>

      <ExamplePanel name="Select">
        <SelectExample />
      </ExamplePanel>

      {/* <Foo /> */}
    </Box>
  )
}

function Foo() {
  const [count, setCount] = createSignal(0)
  createEffect(() => {
    const timeoutId = setInterval(() => {
      setCount((c) => c + 1)
    }, 1000)
    onCleanup(() => clearInterval(timeoutId))
  })
  return (
    <Piv
      icss={[
        { width: count() * 6 + "px", background: "dodgerblue" },
        (console.log("why render?, should can only render once"), {}),
      ]}
    >
      {count()}
    </Piv>
  )
}
/**
 *
 * @todo 1. fade out when come to the end, not play track back.
 * @todo 2. make percent handler to be a hook
 */
function CircularProgressExample() {
  return <RefreshCircle />
}

/**
 * @deprecated
 */
function DrawerExample_Old() {
  const drawerController = useControllerByID<DrawerController>("big-drawer")
  return (
    <>
      <Button
        onClick={() => {
          console.log("drawerController: ", drawerController)
          return drawerController.toggle?.()
        }}
      >
        Open
      </Button>
      <Drawer id="big-drawer" />
    </>
  )
}

function DrawerExample() {
  const drawerController = useControllerByID<DrawerController>("big-drawer")
  return (
    <>
      <Button
        onClick={() => {
          console.log("drawerController: ", drawerController)
          return drawerController.toggle?.()
        }}
      >
        Open
      </Button>
      <Drawer id="big-drawer" />
    </>
  )
}

function ModalExample() {
  const modalController = useControllerByID<ModalController>("example-modal")
  const modalController2 = useControllerByID<ModalController>("example-modal2")
  const couter = createIncresingAccessor()
  return (
    <>
      <Button onClick={() => modalController.toggle?.()}>Open</Button>
      <Modal id="example-modal">Modal1</Modal>
      <Button onClick={() => modalController2.toggle?.()}>Open</Button>
      <Modal id="example-modal2">Modal2 + {couter()}</Modal>
    </>
  )
}

function CSSTransitionExample() {
  const {
    controller: { toggle, opened },
    plugin,
  } = loadModuleTransition({
    onBeforeEnter() {
      console.log("👨‍💻 before enter👉")
    },
    onAfterEnter() {
      console.log("👨‍💻 after enter👉")
    },
    onBeforeLeave() {
      console.log("👨‍💻 before leave👈")
    },
    onAfterLeave() {
      console.log("👨‍💻 after leave👈")
    },
  })

  return (
    <>
      <Button onClick={toggle}>Toggle</Button>
      <Piv
        plugin={plugin}
        icss={{
          backgroundColor: "dodgerblue",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box icss={{ height: opened() ? "200px" : "100px" }}>hello</Box>
      </Piv>
    </>
  )
}

function CSSCollapseExample() {
  const {
    controller: { toggle, opened },
    plugin,
  } = loadModuleCSSCollapse()
  return (
    <>
      <Button onClick={toggle}>Collapse</Button>
      <Piv
        plugin={plugin}
        icss={{
          backgroundColor: "dodgerblue",
          height: "100px",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
        // style={{ height:  '100px' }}
      >
        <Box>click trigger to fade in it</Box>
      </Piv>
    </>
  )
}
function CSSCollapseComponentExample() {
  const [isOpen, { open, close, toggle }] = createDisclosure()

  return (
    <>
      <Button onClick={createInvoker(toggle)}>Collapse</Button>
      <CollapseBox
        open={isOpen()}
        icss={{
          backgroundColor: "dodgerblue",
        }}
        renderFace={() => <Box icss={{ width: "30vw", height: "3em", background: "dodgerblue" }}>blue</Box>}
        renderContent={() => <Box icss={{ width: "30vw", height: "3em", background: "crimson" }}>red</Box>}
      />
    </>
  )
}

// 🤔 maybe can use MutationObserver to detect height change, if change record
function CSSAutoSizeTransitionExample() {
  const { plugin } = loadModuleAutoSizeTransition()
  const [isOpen, { toggle }] = createDisclosure()
  return (
    <>
      <Button onClick={createInvoker(toggle)}>size change</Button>
      <Piv
        plugin={plugin}
        icss={{
          backgroundColor: "dodgerblue",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box icss={{ height: isOpen() ? "200px" : "100px", background: isOpen() ? "crimson" : "dodgerblue" }}>
          click will change inner size
        </Box>
      </Piv>
    </>
  )
}

function SelectExample() {
  return <Select name={"example"} items={["3", "void"] as const} />
}

function InputExample() {
  const [controlledValue, setControlledValue] = createSignal<string>()
  setInterval(() => {
    setControlledValue((s) => (s ?? "") + "1")
  }, 500)
  return (
    <Input
      value={controlledValue}
      icss={{ border: "solid" }}
      onInput={(text) => {
        setControlledValue(text)
      }}
    />
  )
}

function SwitchExample() {
  const [checked, setChecked] = createSignal(false)

  createIntervalEffect(() => {
    setChecked((b) => !b)
  }, 1200)

  return (
    <>
      <Piv
        class={checked() ? "checked" : ""}
        render:firstChild={
          <Piv
            icss={{
              color: checked() ? "dodgerblue" : "crimson",
              width: "0.5em",
              height: "0.5em",
              backgroundColor: "currentcolor",
              transition: "300ms",
            }}
          />
        }
      />
      <Switch
        name="theme-switch"
        isChecked={checked()}
        style={({ isChecked }) => ({ color: isChecked() ? "snow" : "white" })} // <-- will cause rerender , why?
        plugin={renderSwitchThumb}
      />
    </>
  )
}

function TextExample() {
  return <Text editable>can edit content</Text>
}

function ListExample() {
  const mockData = [
    { name: "a", count: 1 },
    { name: "b", count: 2 },
    { name: "c", count: 3 },
    { name: "d", count: 4 },
    { name: "e", count: 5 },
    { name: "f", count: 6 },
    { name: "g", count: 7 },
    { name: "h", count: 8 },
    { name: "i", count: 9 },
    { name: "j", count: 10 },
    { name: "k", count: 11 },
    { name: "l", count: 12 },
    { name: "m", count: 13 },
    { name: "n", count: 14 },
    { name: "o", count: 15 },
    { name: "p", count: 16 },
    { name: "q", count: 17 },
    { name: "r", count: 18 },
    { name: "s", count: 19 },
    { name: "t", count: 20 },
    { name: "u", count: 21 },
    { name: "v", count: 22 },
    { name: "w", count: 23 },
    { name: "x", count: 24 },
    { name: "y", count: 25 },
    { name: "z", count: 26 },
    { name: "aa", count: 26 + 1 },
    { name: "ab", count: 26 + 2 },
    { name: "ac", count: 26 + 3 },
    { name: "ad", count: 26 + 4 },
    { name: "ae", count: 26 + 5 },
    { name: "af", count: 26 + 6 },
    { name: "ag", count: 26 + 7 },
    { name: "ah", count: 26 + 8 },
    { name: "ai", count: 26 + 9 },
    { name: "aj", count: 26 + 10 },
    { name: "ak", count: 26 + 11 },
    { name: "al", count: 26 + 12 },
    { name: "am", count: 26 + 13 },
    { name: "an", count: 26 + 14 },
    { name: "ao", count: 26 + 15 },
    { name: "ap", count: 26 + 16 },
    { name: "aq", count: 26 + 17 },
    { name: "ar", count: 26 + 18 },
    { name: "as", count: 26 + 19 },
    { name: "at", count: 26 + 20 },
    { name: "au", count: 26 + 21 },
    { name: "av", count: 26 + 22 },
    { name: "aw", count: 26 + 23 },
    { name: "ax", count: 26 + 24 },
    { name: "ay", count: 26 + 25 },
    { name: "az", count: 26 + 26 },
  ]
  const [data, setData] = createSignal<typeof mockData>([])
  const increaseCount = createIncresingAccessor()
  createEffect(() => {
    setTimeout(() => {
      setData(mockData)
    }, 100)
  })
  return (
    <InfiniteScrollList items={data} initRenderCount={10} icss={[icssCol({ gap: "16px" }), { height: "30dvh" }]}>
      {(d, idx) => (
        <Box icss={[icssRow, { background: "#0001", width: "100%" }]}>
          <Text>{d.name}</Text>
          <Text>{d.count + increaseCount()}</Text>
        </Box>
      )}
    </InfiniteScrollList>
  )
}

function RadioExample() {
  const [checked, setChecked] = createSignal(false)
  createIntervalEffect(() => {
    setChecked((b) => !b)
  }, 1200)
  return <Radio option="gender" isChecked={checked()} />
}

function ComponentFactoryExample() {
  const data = {
    isOpen: false,
    text: "hello world",
  }
  const [store, setStore] = createStore(data)
  createEffect(() => {
    setInterval(() => {
      setStore("isOpen", (b) => !b)
    }, 1000)
  })
  return (
    <>
      <RenderFactory
        data={store}
        widgetCreateRule={(value) =>
          switchCase<any, any>(
            value,
            [
              [
                (v) => typeof v === "boolean",
                () => (storeValue: Accessor<boolean>) => <Switch isChecked={storeValue} />,
              ],
              [(v) => typeof v === "string", () => (storeValue: Accessor<string>) => <Input value={storeValue} />],
            ],
            value,
          )
        }
      />
    </>
  )
}

function PopoverExample() {
  const { plugins: popoverPlugins, state: popoverState } = buildPopover({ triggerBy: "click", placement: "right" }) // <-- run on define, not good
  const { plugin: hoverPlugin, state: hoverState } = useHoverPlugin({ onHover: () => console.log("hover") })
  return (
    <>
      <Button plugin={[popoverPlugins.trigger, hoverPlugin]}>💬popover</Button>
      <Box plugin={popoverPlugins.panel} icss={[{ border: "solid", minHeight: "5em" }, icssCardPanel]}>
        hello world
      </Box>
    </>
  )
}

function TabsExample() {
  return (
    <Tabs>
      <Tabs.List>
        <Tabs.Tab>{({ selected }) => (selected() ? "🟢" : "🔴")} Tab1</Tabs.Tab>
        <Tabs.Tab>{({ selected }) => (selected() ? "🟢" : "🔴")} Tab2</Tabs.Tab>
        <Tabs.Tab>{({ selected }) => (selected() ? "🟢" : "🔴")} Tab3</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  )
}

function PropContextExample() {
  return (
    <AddProps icss={{ paddingInline: "24px", paddingBlock: "8px" }}>
      <Box icss={{ border: "solid" }}>
        <Piv innerController={{ say: () => "ControllerContext should can receive the message" }}>
          <Box
            merge:onClick={() => {
              console.log("click PropContext description")
            }}
            icss={{ cursor: "pointer", border: "dashed", borderColor: cssOpacity("currentcolor", 0.6) }}
          >
            PropContext can pass to deep nested components
          </Box>
          <ControllerContextExample />
        </Piv>
      </Box>
    </AddProps>
  )
}
function ControllerContextExample(kitProps: ValidProps) {
  const { contextController } = useKitProps(kitProps, { name: "ControllerContextExample" })
  const { say } = contextController as { say: () => string }
  return <Box>{say?.()}</Box>
}

function UploadExample() {
  const { buttonPlugin } = useHTMLUpload()
  return (
    <>
      <Button plugin={[buttonPlugin]}>picker</Button>
    </>
  )
}

/**
 * hook for upload file by html input
 */
function useHTMLUpload() {
  const buttonPlugin = createPlugin(() => () => ({
    onClick: ({ el }) => {
      const images = pickImages()
      postToSercer(images)
    },
  }))
  return { buttonPlugin }

  /**
   * utils
   */
  function pickImages() {
    const fileHandles = showOpenFilePicker({
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
          },
        },
      ],
      multiple: true,
    })
    return fileHandles
  }

  /**
   * utils
   */
  function postToSercer(fileHandles: Promise<FileSystemFileHandle[]>) {
    postFiles(getFilesFromHandles(fileHandles))
  }
}

function postFiles(files: MayPromise<File[]>) {
  Promise.resolve(files).then((files) => {
    const data = files.reduce((formData, file, idx) => {
      formData.append(`image.${idx}`, file)
      return formData
    }, new FormData())

    fetch("api/upload", { method: "POST", body: data })
  })
}

/**
 * since dom [FileSystemFileHandler](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) is complicated, so provide a helper function to get file from it
 */
async function getFilesFromHandles(fileHandles: MayPromise<FileSystemFileHandle[]>) {
  const handles = await Promise.resolve(fileHandles)
  return Promise.all(handles.map((handle) => handle.getFile()))
}

/**
 * for specific tab item
 */
type TabPluginOption = {
  value: string
}

/**
 * make some element to be gouped like: tabs
 * ui kit creator hook
 */
function useTabs() {
  const [activeTab, setActiveTab] = createSignal(0)

  const TabsContext = createContext()

  function TabsContextProvider(props: { children?: JSXElement }) {
    return <TabsContext.Provider value={{ activeTab }}>{props.children}</TabsContext.Provider>
  }

  const tabPlugin = createPlugin<TabPluginOption>(({ value }) => () => ({ onClick: ({ el }) => {} }))

  return { TabsContextProvider }
}

function ViewTransitionSliderBoxExample() {
  const [contentIndex, setContentIndex] = createSignal(0)
  const [count, setCount] = createSignal(0)
  return (
    <Box>
      <ViewTransitionSliderBox contentIndex={contentIndex()}>
        <Box
          icss={{
            width: "20em",
            height: "10em",
            background: count() % 2 === 0 ? "crimson" : "dodgerblue",
            color: "white",
          }}
        >
          content {count()}
        </Box>
      </ViewTransitionSliderBox>

      <Button
        onClick={() => {
          setContentIndex((n) => n + 1)
          setTimeout(() => {
            setCount((c) => c + 1)
          }, 0)
        }}
      >
        Increase Count
      </Button>
    </Box>
  )
}

function TemporaryExample() {
  const gap = "20px"
  return (
    <Box
      icss={[
        {
          margin: "8px 16px",
          padding: "16px 24px",
          borderRadius: "16px",
          background: cssOpacity(colors.primary, 0.2),
          "> *": {
            padding: "12px 16px",
            borderRadius: "8px",
            background: cssOpacity(colors.primary, 0.1),
          },
        },
        icssGrid.config({
          slot: 4,
          templateColumn: "2fr 1fr 1fr 1fr",
          gap,
          dividerWidth: "1px",
          dividerPadding: "2px",
          dividerBackground: cssRepeatingLinearGradient({
            colors: [
              [colors.transparent, "0px"],
              [colors.transparent, "10px"],
              [cssOpacity(colors.primary, 0.3), "10px"],
              [cssOpacity(colors.primary, 0.3), "20px"],
            ],
          }),
        }),
      ]}
    >
      <Box icss={[{ height: "13em" }, icssCenter]}>Hello</Box>
      <Box
        icss={[
          icssCenter,
          {
            // background: `${cssLinearGradient({ direction: "to bottom", colors: ["transparent", "dodgerblue"] })}, ${cssRadialGradient({ colors: [cssOpacity("crimson", 0.8), "transparent"] })}`,
            _background_2: `${cssRadialGradient({ colors: [cssOpacity("#33138e", 0.8), "transparent"] })}`,
            _background_3: `${cssLinearGradient({ direction: "to bottom", colors: ["transparent", "dodgerblue"] })}`,
            backgroundBlendMode: "multiply",
            boxShadow: `inset 0 0 32px ${cssOpacity("#33138e", 0.8)}`,
            scale: ".5",
            _scale_: "2",
          },
        ]}
      >
        World
      </Box>
      <Box icss={icssCenter}>World</Box>
      <Box icss={icssCenter}>World</Box>
    </Box>
  )
}

const SlotBox = Box
const icssSlotBox = { display: "flex", padding: "8px", background: colors.backgroundLight50, gap: "4px" }
function DragAndDropExample() {
  const gap = "20px"
  const icssFlexItem: ICSS = {
    padding: "12px 16px",
    borderRadius: "8px",
    background: cssOpacity(colors.primary, 0.1),
    translate: "8px",
  }

  return (
    <Group>
      <Box
        icss={{ height: "20em" }}
        plugin={droppablePlugin.config({ dragoverIcss: { borderColor: "dodgerblue" } })}
      ></Box>
      {/* TODO: should can move between different flex slots */}
      <Box
        icss={[
          {
            margin: "8px 16px",
            padding: "16px 24px",
            borderRadius: "16px",
            background: cssOpacity(colors.primary, 0.2),
            height: "530px",
            fontSize: "2em",
          },
          icssGrid.config({
            slot: 4,
            templateColumn: "2fr 1fr 1fr 1fr",
            gap,
            // dividerWidth: "1px",
            // dividerPadding: "2px",
            // dividerBackground: cssRepeatingLinearGradient({
            //   colors: [
            //     [colors.transparent, "0px"],
            //     [colors.transparent, "10px"],
            //     [cssOpacity(colors.primary, 0.3), "10px"],
            //     [cssOpacity(colors.primary, 0.3), "20px"],
            //   ],
            // }),
          }),
        ]}
        plugin={droppablePlugin}
      >
        <Box icss={[icssCenter, icssFlexItem]} plugin={itemSortablePlugin}>
          👋
        </Box>
        <Box icss={[icssCenter, icssFlexItem]} plugin={itemSortablePlugin}>
          2
        </Box>
        <Box icss={[icssCenter, icssFlexItem]} plugin={itemSortablePlugin}>
          3
        </Box>
        <Box icss={[icssCenter, icssFlexItem]} plugin={itemSortablePlugin}>
          4
        </Box>
      </Box>

      <Box icss={[{ padding: "8px", background: colors.backgroundLight30 }, icssGrid.config({ slot: 4, gap: "8px" })]}>
        <SlotBox icss={icssSlotBox} plugin={droppablePlugin}>
          <Box
            icss={[icssCenter, icssFlexItem, { background: "#abc4ff" }]}
            plugin={[
              draggablePlugin.config({ canOnlyContent: true }),
              droppablePlugin.config({ canOnlyContent: true }),
            ]}
          >
            Drag item 1
          </Box>
          <Box
            icss={[icssCenter, icssFlexItem]}
            plugin={[
              draggablePlugin.config({ canOnlyContent: true }),
              droppablePlugin.config({ canOnlyContent: true }),
            ]}
          >
            Drag item 2
          </Box>
        </SlotBox>
        <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>
        <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>
        <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>
      </Box>

      <Box plugin={droppableSlotsPlugin}></Box>
    </Group>
  )
}

const droppableSlotsPlugin = createPlugin(() => () => ({
  "render:firstChild": [
    <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>,
    <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>,
    <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>,
    <SlotBox icss={icssSlotBox} plugin={droppablePlugin}></SlotBox>,
  ],
  icss: [{ padding: "8px", background: colors.backgroundLight30 }, icssGrid.config({ slot: 4, gap: "8px" })],
}))

function FloatPanelExample() {
  return (
    <FloatingInfoPanel>
      <Box
        icss={{
          width: "30px",
          height: "13em",
          padding: "2em",
        }}
      >
        hello world
      </Box>
    </FloatingInfoPanel>
  )
}
