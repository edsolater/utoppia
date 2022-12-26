import { createKit, Div, DivChildNode } from '@edsolater/uikit'

export const MainContentArea = createKit(
  'MainContentArea',
  ({ renderContentComponent }: { renderContentComponent: () => DivChildNode }) => {
    return <Div>{renderContentComponent()}</Div>
  }
)
