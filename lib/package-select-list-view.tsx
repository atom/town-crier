import etch from 'etch'
import BugReport from './bug-report'

interface PackageSelectListProps {
  report: BugReport
}

export default class PackageSelectListView {
  private refs: any
  private report: BugReport

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
            this.report.packageList.map((packageName: string) => {
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

    this.update({report: this.report})
  }
}
