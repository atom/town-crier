/** @babel */
/** @jsx etch.dom */

import {CompositeDisposable} from 'atom'
import etch from 'etch'

/**
 * Adds a tooltip to the contained child that has the property `ref='tooltipTarget'`.
 *
 * All `props` are passed to the `atom.tooltips.add()` function.
 */
export default class TooltipView {
  constructor (props, children) {
    this.props = props
    this.children = children

    etch.initialize(this)
  }

  render () {
    return (
      <div>
        {this.children}
      </div>
    )
  }

  update (props, children) {
    this.props = props
    this.children = children

    return etch.update(this)
  }

  destroy () {
    etch.destroy(this)
  }

  writeAfterUpdate () {
    if (this.tooltip) {
      this.tooltip.dispose()
    }

    this.tooltip = atom.tooltips.add(this.refs.tooltipTarget, this.props)
  }
}
