import etch from 'etch'

interface SpinnerViewProps {
  className: string
  text: string
}

export default class SpinnerView {
  private className: string
  private props: SpinnerViewProps

  constructor (props: SpinnerViewProps) {
    this.props = props

    this.setClassName()

    etch.initialize(this)
  }

  render () {
    return (
      <div className={this.className}>
        <span class='loading loading-spinner-tiny inline-block'></span>
        <span>{this.props.text}</span>
      </div>
    )
  }

  update (props: SpinnerViewProps) {
    this.props = props

    this.setClassName()

    return etch.update(this)
  }

  destroy () {
    etch.destroy(this)
  }

  setClassName () {
    if (this.props.text && this.props.text.length > 0) {
      this.className = `spinner-view ${this.props.className}`
    } else {
      this.className = `spinner-view hidden ${this.props.className}`
    }
  }
}
