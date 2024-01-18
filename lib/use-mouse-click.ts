import { useRef } from 'react'
import { useEventListener } from 'utils/hooks'

/**
 * Often when the text is being selected,
 * the user releases the cursor outside the content boundaries,
 * thus causing an unintentional click.
 */
export function usePreventUnintentionalClick(
  ref: React.MutableRefObject<HTMLDivElement | null>,
  onDismiss: ((event: MouseEvent | React.KeyboardEvent) => void) | undefined
): void {
  const mouseDownRef = useRef<HTMLElement | null>(null)

  useEventListener('mousedown', (e) => (mouseDownRef.current = e.target as HTMLElement))
  useEventListener('mouseup', (e) => mouseDownRef.current === ref.current && onDismiss?.(e))
}
