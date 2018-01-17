import etch from 'etch'

interface SpinnerViewProps {
  className: string
  text: string
}

export default class SpinnerView implements Etchable<SpinnerViewProps> {
  private className: string
  private props: SpinnerViewProps

  public constructor(props: SpinnerViewProps) {
    this.props = props

    this.setClassName()

    etch.initialize(this)
  }

  public render() {
    return (
      <div className={this.className}>
        <span className='loading loading-spinner-tiny inline-block'></span>
        <span>{this.props.text}</span>
      </div>
    )
  }

  public update(props: SpinnerViewProps) {
    this.props = props

    this.setClassName()

    return etch.update(this)
  }

  public destroy() {
    etch.destroy(this)
  }

  private setClassName(): void {
    if (this.props.text && this.props.text.length > 0) {
      this.className = `spinner-view ${this.props.className}`
    } else {
      this.className = `spinner-view hidden ${this.props.className}`
    }
  }
}
