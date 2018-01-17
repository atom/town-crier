declare namespace JSX {
  export interface Element {
    autofocus?: boolean
    className?: string
    disabled?: boolean
    id?: string
    label?: string
    on?: any
    ref?: string
    selected?: boolean
    value?: string
  }

  export interface IntrinsicElements {
    div: JSX.Element
    label: JSX.Element
    option: JSX.Element
    select: JSX.Element
    span: JSX.Element
  }
}
