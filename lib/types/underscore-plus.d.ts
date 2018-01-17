declare module 'underscore-plus' {
  /**
   * Humanizes the event name according to platform conventions.
   */
  export function humanizeEventName(eventName: string, eventDoc?: string): string

  /**
   * Humanize the keystroke according to platform conventions. This method
   * attempts to mirror the text the given keystroke would have if displayed in
   * a system menu.
   *
   *  keystroke - A String keystroke to humanize such as `ctrl-O`.
   *  platform  - An optional String platform to humanize for (default:
   *              `process.platform`).
   *
   * Returns a humanized representation of the keystroke.
   */
  export function humanizeKeystroke(keystroke: string, platform?: string): string

  export function uncamelcase(text: string): string
}
