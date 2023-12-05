import './modal.css'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

import { keyListener, stopPropagation } from '~/utils/dom-event'
import { findFirstFocusable } from '~/utils/dom-event/find-first-focusable'
import { fns } from '~/utils/function'
import { useEventListener } from '~/utils/hooks'

import { c, generateId } from '../../../utils/core'

Modal.displayName = 'na-Modal'
ModalWrapper.displayName = Modal.displayName

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
  containerElement: Element
  opened: boolean
  firstFocused?: boolean
  onDismiss?: ((event: MouseEvent | React.KeyboardEvent) => void) | undefined
}

/**
 * Делаем Wrapper так как без него происходит преждевременная подписка в useEventListener
 */
export default function ModalWrapper(props: Props): JSX.Element | null {
  const { opened, ...modalProps } = props
  if (!opened) return null
  return <Modal {...modalProps} />
}

function Modal(props: Omit<Props, 'opened'>): JSX.Element {
  const id = useMemo(() => generateId(), [])
  const focusTaken = useRef<HTMLElement | null>(null)
  const { containerElement, children, firstFocused, onDismiss, ...divProps } = props

  const ref = useRef<HTMLDivElement | null>(null)
  const mouseDownRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    focusTaken.current = document.activeElement as HTMLElement
    if (ref.current === null) return
    if (firstFocused) findFirstFocusable(ref.current)?.focus()
    else ref.current.focus()

    return () => {
      focusTaken.current?.focus?.()
    }
  }, [])

  useEventListener('mousedown', (e) => (mouseDownRef.current = e.target as HTMLElement))
  useEventListener('mouseup', (e) => mouseDownRef.current === ref.current && onDismiss?.(e))

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      {...divProps}
      onKeyDown={fns(_handleKeyDown, stopPropagation, props.onKeyDown)}
      ref={ref}
      tabIndex={-1}
      className={c(props.className, Modal.displayName, `id-${id}`)}
    >
      {children}
    </div>,
    containerElement
  )

  /**
   * Private
   */

  function _handleKeyDown(e: React.KeyboardEvent): void {
    keyListener({ key: 'Escape' }, () => onDismiss?.(e))(e)
    keyListener({ key: 'Tab' }, () => setTimeout(_returnFocus))(e)
  }

  function _returnFocus(): void {
    function isInsideModal(element: HTMLElement): boolean {
      if (element.parentElement?.classList.contains(`id-${id}`)) return true
      return element.parentElement === null ? false : isInsideModal(element.parentElement)
    }
    // TODO создать функцию getLastFocusable и проверять при нажатии Tab можно ли сменить фокус
    if (ref.current === null) return
    if (isInsideModal(document.activeElement as HTMLElement)) return
    findFirstFocusable(ref.current)?.focus()
  }
}
