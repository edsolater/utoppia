import {
  Accessify,
  Box,
  Fragnment,
  Group,
  Input,
  ItemBox,
  Modal,
  Row,
  Text,
  createFormField,
  icssCenter,
  icssCenterY,
  icssClickable,
  useInputController,
} from "@edsolater/pivkit"
import { Accessor, createEffect } from "solid-js"
import { AppLogo } from "../../components/AppLogo"
import { WalletWidget } from "../../components/WalletWidget"
import { store } from "../../stores/data/store"
import { parseUrl } from "../../utils/parseUrl"
import { NaBar_NavWrapBoxProps } from "./NavWrapBox"

export type NavBarProps = NaBar_NavWrapBoxProps

export function NavBar(props: NavBarProps) {
  return (
    <Row icss={{ paddingInline: "32px", alignItems: "center", justifyContent: "space-between" }}>
      {/* TODO: not correct for this */}
      <AppLogo />
      <Row>
        <SettingButtonTrigger />
        <WalletWidget />
      </Row>
    </Row>
  )
}

/**
 * triggers
 */
function SettingButtonTrigger() {
  return (
    <Fragnment>
      <Box
        icss={[icssCenter, { padding: "8px", borderRadius: "8px" }, icssClickable]}
        // onClick={() => {
        //   appSettingsModalControllers()?.open()
        // }}
      >
        ⚙️
      </Box>
      <SettingsContent />
    </Fragnment>
  )
}

// const [appSettingsModalControllers, setSettingControllerRef] = createControllerRef<ModalController>() // it will cause bug: computations created outside a `createRoot` or `render` will never be disposed

/**
 * modal
 */
function SettingsPanelDialog() {
  return (
    <Modal open>
      <SettingsContent />
    </Modal>
  )
}

/**
 * setting form details
 */
function SettingsContent() {
  const { value, setValue, isValid, isEmpty } = createFormField({
    name: "rpcUrl",
    value: store.rpc?.url,
    validRule: (value) => parseUrl(value).isValid,
  })
  const inputController = useInputController("Input__rpcUrl")
  createEffect(() => {
    console.log("isFocused: ", inputController.isFocused?.())
  })
  return (
    <Group>
      <Group name={"section"}>
        <ItemBox icss={{ gap: "4px" }}>
          <Text icss={icssCenterY}>RPC:</Text>
          <Input
            id="Input__rpcUrl"
            value={value}
            onInput={(text) => {
              setValue(text)
            }}
            icss={{ borderStyle: "solid", borderColor: isEmpty() ? "gray" : isValid() ? "green" : "crimson" }}
          />
        </ItemBox>
      </Group>
    </Group>
  )
}

export type FormField<T> = {
  value: Accessor<T>
  setValue: (to: T) => void
  isEmpty: Accessor<boolean>
  isValid: Accessor<boolean>
}

export type UseFormFieldOpts<T> = {
  name: string
  value?: Accessify<T>
  onChange?(value: T): void

  // if not specified, value will always be considered as valid
  validRule?(value: any): boolean
}
