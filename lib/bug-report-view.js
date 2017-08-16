/** @babel */
/** @jsx etch.dom */

import etch from 'etch'

import PackageSelectListView from './package-select-list-view'
import SpinnerView from './spinner-view'
import VersionView from './version-view'

export default class BugReportView {
  constructor (report) {
    this.report = report

    this.disposable = atom.commands.add('.town-crier.bug-report-view', {
      'core:focus-next': () => {
        this.focusNext()
      },
      'core:focus-previous': () => {
        this.focusPrevious()
      }
    })

    this.tabOrder = this.createTabOrder()
    this.valid = this.report.isValid()

    etch.initialize(this)
  }

  render () {
    return (
      <div className='town-crier bug-report-view pane-item native-key-bindings' tabIndex='-1'>
        <h1>Bug Report</h1>
        <p><span className='required-star'>*</span> indicates a required field</p>
        <div className='block required'>
          <label>For package</label>
          <PackageSelectListView
            report={this.report}/>
        </div>
        <div className='block required'>
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
        <div className='block required'>
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
        <p>
          Please enter the steps you follow to reproduce the problem. Empty steps will not be
          submitted with the report.
        </p>
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
          <VersionView label='Atom Versions' version={this.report.atomVersion} />
          <VersionView label='apm Versions' version={this.report.apmVersion} />
          <div className='block required'>
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
        <h2>Optional Information</h2>
        <p>This information has been found to be useful in diagnosing issues. Check the pieces of
        information you want to include.</p>
        <div className='block optional-information'>
          {
            this.report.optionalInformation.getTypes().map(type => {
              return (
                <div>
                  <input
                    ref={type + 'Checkbox'}
                    className='input-checkbox'
                    type='checkbox'
                    checked={this.report.optionalInformation.getInfo(type).include}
                    />
                  <label>{this.report.optionalInformation.getDescription(type)}</label>
                </div>
              )
            })
          }
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
            disabled={!this.valid}
            on={{click: this.didClickSubmitReport}}>
              Submit report
          </button>
          <SpinnerView className='inline-block' text={this.report.spinnerText} />
        </div>
      </div>
    )
  }

  update (report) {
    this.report = report
    this.tabOrder = this.createTabOrder()
    this.valid = this.report.isValid()

    return etch.update(this)
  }

  destroy () {
    this.report.destroy()
    this.disposable.dispose()

    etch.destroy(this)
  }

  didChange () {
    this.updateModel()
  }

  didClickAddStep () {
    this.report.addReproStep()
  }

  didClickPreview () {
    this.report.preview()
  }

  didClickSubmitReport () {
    this.report.submit()
  }

  createTabOrder () {
    let order = [
      'package-select',
      'title-input',
      'description-input'
    ]

    for (let i = 1; i <= this.report.reproSteps.length; ++i) {
      order.push(`repro-step-${i}`)
    }

    return order.concat([
      'expected-input',
      'actual-input',
      'os-version-input',
      'additional-info-input'
    ])
  }

  focusNext () {
    const currentId = document.activeElement.id
    let index = this.tabOrder.indexOf(currentId) + 1
    if (index === this.tabOrder.length) {
      index = 0
    }

    this.element.querySelector(`#${this.tabOrder[index]}`).focus()
  }

  focusPrevious () {
    const currentId = document.activeElement.id
    let index = this.tabOrder.indexOf(currentId) - 1
    if (index === 0) {
      index = this.tabOrder.length - 1
    }

    this.element.querySelector(`#${this.tabOrder[index]}`).focus()
  }

  renderReproSteps () {
    return this.report.reproSteps.map((step, index) => {
      const count = index + 1
      const placeholder = `Step ${count}`
      const id = `repro-step-${count}`

      return (
        <div className='block'>
          <input
            className='input-text repro-step-input'
            id={id}
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

    this.update(this.report)
  }
}
