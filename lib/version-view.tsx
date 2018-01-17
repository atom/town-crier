import etch from 'etch'

export interface VersionViewProps {
  label: string
  version: string
}

export default class VersionView implements Etchable<any> {
  private props: VersionViewProps

  public constructor(props: VersionViewProps) {
    this.props = props

    etch.initialize(this)
  }

  public render() {
    return (
      <div className='version-view block'>
        <label>{this.props.label}</label>
        <div>
          { this.props.version.split('\n').map(line => { return <div>{line}</div> }) }
        </div>
      </div>
    )
  }

  public update(props: VersionViewProps) {
    this.props = props

    return etch.update(this)
  }

  public destroy() {
    etch.destroy(this)
  }
}
