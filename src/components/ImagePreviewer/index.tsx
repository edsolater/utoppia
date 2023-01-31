import { createKit, Image } from '@edsolater/uikit'

/**
 * Ability: preview image.
 *
 * component also provide useful controller and picture explorer widgets
 */
export const ImagePreviewer = createKit('ImagePreviewer', ({ src }: { src: string }) => {
  return <Image src={src} />
})
