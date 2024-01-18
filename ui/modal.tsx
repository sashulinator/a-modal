import './modal.css'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
// https://github.com/sashulinator/utils-core
import { c, generateId } from 'utils/core'
import {
  findFirstFocusable,
  findLastFocusable,
  findNextFocusableSibling,
  findPreviousFocusableSibling,
  keyListener,
} from 'utils/dom-event'
import { fns } from 'utils/function'

import { usePreventUnintentionalClick } from '../lib/use-mouse-click'

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  containerElement: Element
  opened: boolean
  firstFocused?: boolean | undefined
  onDismiss?: ((event: MouseEvent | React.KeyboardEvent) => void) | undefined
}

const displayName = 'a-Modal'

/**
 * Modal component
 */
function Component(props: Omit<Props, 'opened'>): JSX.Element {
  const { containerElement, children, firstFocused = true, onDismiss, ...divProps } = props

  const id = useMemo(generateId, [])
  const ref = useRef<HTMLDivElement | null>(null)
  const focusTaken = useRef<HTMLElement | null>(null)

  useLayoutEffect(_returnFocus, [])
  useLayoutEffect(_focusInside, [])

  usePreventUnintentionalClick(ref, onDismiss)

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      {...divProps}
      onKeyDown={fns(_handleKeyDown, props.onKeyDown)}
      ref={ref}
      tabIndex={-1}
      className={c(props.className, displayName, `id-${id}`)}
    >
      {children}
    </div>,
    containerElement
  )

  /**
   * Private
   */

  function _focusInside(): void {
    if (ref.current === null) throw Error('`ref` does not exist')
    ;(document.activeElement as HTMLElement)?.blur()
    if (firstFocused) findFirstFocusable(ref.current)?.focus()
  }

  function _returnFocus(): () => void {
    focusTaken.current = document.activeElement as HTMLElement
    return () => focusTaken.current?.focus?.()
  }

  function _handleKeyDown(e: React.KeyboardEvent): void {
    if (!isElementInsideModal(e.target as HTMLElement)) return
    keyListener({ key: 'Escape' }, onDismiss)(e)
    keyListener({ key: 'Tab' }, _preventLosingFocus)(e)
  }

  function _preventLosingFocus(e: React.KeyboardEvent): void {
    if (ref.current === null) throw Error('`ref` does not exist')

    const next = e.shiftKey
      ? findPreviousFocusableSibling(document.activeElement as HTMLElement)
      : findNextFocusableSibling(document.activeElement as HTMLElement)

    if (next === null) {
      e.preventDefault()
      findFirstFocusable(ref.current)?.focus()
      return
    }

    if (!isElementInsideModal(next)) {
      e.preventDefault()
      e.shiftKey ? findLastFocusable(ref.current)?.focus() : findFirstFocusable(ref.current)?.focus()
    }
  }

  function isElementInsideModal(element: HTMLElement): boolean {
    if (element.parentElement?.classList.contains(`id-${id}`)) return true
    return element.parentElement === null ? false : isElementInsideModal(element.parentElement)
  }
}

Component.displayName = displayName

/**
 * Private
 */
// Делаем Wrapper так как без него происходит преждевременная подписка в useEventListener
export default function ComponentWrapper(props: Props): JSX.Element | null {
  const { opened, ...modalProps } = props
  if (!opened) return null
  return <Component {...modalProps} />
}

ComponentWrapper.displayName = displayName // The same name because of storybook title
