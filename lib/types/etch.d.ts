
type MaybePromise = Promise<void> | void

interface Etchable<T> {
  refs: any

  render(): JSX.Element

  update(props: T): MaybePromise

  destroy(): MaybePromise
}

interface Node {
}

declare module etch {
  export function initialize(component: Etchable<any>): void

  export function update(component: Etchable<any>, replaceNode: boolean): Promise<void>

  export function updateSync(component: Etchable<any>, replaceNode: boolean): void

  export function destroy(component: Etchable<any>, replaceNode: boolean): Promise<void>

  export function destroySync(component: Etchable<any>, replaceNode: boolean): void
}
