/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

export default class BugReportView {
  constructor (report) {
    this.report = report

    etch.initialize(this)
  }

  render () {
    return (
      <div className='town-crier bug-report pane-item native-key-bindings' tabIndex='-1'>
        <h1>Bug Report</h1>
        <div className='block'>
          <label>For package</label>
          {this.renderPackageSelectList()}
        </div>
        <div className='block'>
          <label>Title</label>
          <input
            ref='titleInput'
            className='input-text'
            id='title-input'
            type='text'
            placeholder='Enter title'
            value={this.report.title}
            on={{change: this.didChange}}/>
        </div>
        <div className='block'>
          <label>Description</label>
          <textarea
            ref='descriptionInput'
            className='input-text'
            id='description-input'
            placeholder='Enter description'
            on={{change: this.didChange}}>
              {this.report.description}
          </textarea>
        </div>
        <h2>Steps to Reproduce</h2>
        <div className='block'>
          <div className='block'>
            {this.renderReproSteps()}
            <button className='btn' on={{click: this.didClickAddStep}}>+</button>
          </div>
          <div className='block'>
            <label>Expected Result</label>
            <input
              ref='expectedInput'
              className='input-text inline-block'
              id='expected-input'
              type='text'
              placeholder='What you expected to happen'
              value={this.report.expectedResult}
              on={{change: this.didChange}}/>
          </div>
          <div className='block'>
            <label>Actual Result</label>
            <input
              ref='actualInput'
              className='input-text inline-block'
              id='actual-input'
              type='text'
              placeholder='What actually happened'
              value={this.report.actualResult}
              on={{change: this.didChange}}/>
          </div>
        </div>
        <h2>Version Information</h2>
        <div className='block'>
          <div className='block'>
            <label>Atom Versions</label>
            <div>
              {this.renderVersion(this.report.atomVersion)}
            </div>
          </div>
          <div className='block'>
            <label>apm Versions</label>
            <div>
              {this.renderVersion(this.report.apmVersion)}
            </div>
          </div>
          <div className='block'>
            <label>OS Version</label>
            <input
              ref='osVersionInput'
              className='input-text'
              id='os-version-input'
              type='text'
              value={this.report.osVersion}
              on={{change: this.didChange}}/>
          </div>
        </div>
        <h2>Additional Information</h2>
        <p>Your list of installed packages will be included in the final report automatically.</p>
        <div className='block'>
          <textarea
            ref='additionalInformationInput'
            className='input-text'
            id='additional-info-input'
            placeholder='Please supply any additional information that might be helpful'
            on={{change: this.didChange}}>
            {this.report.additionalInformation}
          </textarea>
        </div>
        <div className='block'>
          <button
            className='btn inline-block icon icon-file'
            id='preview-button'
            on={{click: this.didClickPreview}}>
              Preview
          </button>
          <button
            className='btn btn-primary icon icon-cloud-upload inline-block'
            id='report-bug-button'
            disabled={!this.report.isValid()}
            on={{click: this.didClickReportBug}}>
              Report bug
          </button>
        </div>
      </div>
    )
  }

  update (report) {
    this.report = report

    return etch.update(this)
  }

  destroy () {
    this.report.destroy()

    etch.destroy(this)
  }

  didChange () {
    this.updateModel()
  }

  didClickAddStep () {
    this.report.reproSteps.push('')

    this.update(this.report)
  }

  didClickPreview () {
    this.report.preview()
  }

  didClickReportBug () {
    this.report.submit()
  }

  renderVersion (text) {
    return (text.split('\n').map(line => { return <div>{line}</div> }))
  }

  renderPackageSelectList () {
    return (
      <div className='block'>
        <select on={{change: this.didChange}} autofocus>
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
            this.report.packageList.map((package) => {
              return (
                <option
                  label={package}
                  value={package}
                  selected={package === this.report.forPackage}/>
              )
            })
          }
        </select>
      </div>
    )
  }

  renderReproSteps () {
    let count = 0

    return this.report.reproSteps.map((step) => {
      count++
      const placeholder = `Step ${count}`

      return (
        <div className='block'>
          <input
            className='input-text repro-step-input'
            type='text'
            placeholder={placeholder}
            value={step}
            on={{change: this.didChange}}/>
        </div>
      )
    })
  }

  updateModelReproSteps () {
    const elements = this.element.querySelectorAll('.repro-step-input')
    let changed = false

    for (let i = 0; i < elements.length; ++i) {
      if (this.report.reproSteps[i] !== elements.item(i).value) {
        this.report.reproSteps[i] = elements.item(i).value
        changed = true
      }
    }

    if (changed) {
      this.update(this.report)
    }
  }

  updateModel () {
    this.report.title = this.refs.titleInput.value
    this.report.description = this.refs.descriptionInput.value
    this.report.expectedResult = this.refs.expectedInput.value
    this.report.actualResult = this.refs.actualInput.value
    this.report.osVersion = this.refs.osVersionInput.value
    this.report.additionalInformation = this.refs.additionalInformationInput.value

    this.updateModelReproSteps()

    this.report.updatePreview()
  }
}
