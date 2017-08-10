/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

export default class VersionView {
  constructor (props) {
    this.props = props

    etch.initialize(this)
  }

  render () {
    return (
      <div className='version-view block'>
        <label>{this.props.label}</label>
        <div>
          { this.props.version.split('\n').map(line => { return <div>{line}</div> }) }
        </div>
      </div>
    )
  }

  update (props) {
    this.props = props

    return etch.update(this)
  }

  destroy () {
    etch.destroy(this)
  }
}
