import etch from 'etch'

interface PackageSelectListProps {
  report: ReportProps
}

interface ReportProps {
  forPackage: string
}

export default class PackageSelectListView implements Etchable<PackageSelectListProps> {
  private report: ReportProps

  constructor ({report}: PackageSelectListProps) {
    this.report = report

    etch.initialize(this)
  }

  render () {
    return (
      <div className='package-select-list-view block'>
        <select id='package-select' ref='packageSelect' on={{change: this.didChange}} autofocus>
          <option
            label='What package is this report for?'
            value=''
            selected={this.report.forPackage === ''}/>
          <option
            label='Atom Core'
            value='atom'
            selected={this.report.forPackage === 'atom'}/>
          <option disabled>────────────────────</option>
          {
            this.report.packageList.map((packageName) => {
              return (
                <option
                  label={packageName}
                  value={packageName}
                  selected={packageName === this.report.forPackage}/>
              )
            })
          }
        </select>
      </div>
    )
  }

  update ({report}: PackageSelectListProps) {
    this.report = report

    return etch.update(this)
  }

  destroy () {
    etch.destroy(this)
  }

  didChange () {
    this.report.forPackage = this.refs.packageSelect.value

    this.report.updatePreview()

    this.update(this)
  }
}
