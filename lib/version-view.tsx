import etch from 'etch'

export interface VersionViewProps {
  label: string
  version: string
}

export default class VersionView {
  private props: VersionViewProps

  constructor (props: VersionViewProps) {
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

  update (props: VersionViewProps) {
    this.props = props

    return etch.update(this)
  }

  destroy () {
    etch.destroy(this)
  }
}
