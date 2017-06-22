/** @babel */

import {CompositeDisposable, Emitter} from 'atom'
import fs from 'fs'
import temp from 'temp'

import BugReportView from './bug-report-view'
import {getApmVersion, getAtomVersion, getOsVersion} from './version-helpers'

export default class BugReport {
  constructor () {
    this.title = ''
    this.description = ''
    this.forPackage = ''
    this.reproSteps = ['', '', '']
    this.expectedResult = ''
    this.actualResult = ''
    this.atomVersion = ''
    this.apmVersion = ''
    this.osVersion = ''
    this.additionalInformation = ''

    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.packageList = atom.packages.getAvailablePackageNames()
    Promise.all([getAtomVersion(), getApmVersion(), getOsVersion()]).then(values => {
      this.atomVersion = values[0]
      this.apmVersion = values[1]
      this.osVersion = values[2]

      this.view.update(this)
    })
  }

  get element () {
    return this.view.element
  }

  get view () {
    if (!this.reportView) {
      this.reportView = new BugReportView(this)
    }

    return this.reportView
  }

  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  destroy () {
    if (this.previewFile) {
      fs.unlink(this.previewFile, (err) => {
        if (err) {
          throw err
        }
      })
    }

    this.emitter.emit('did-destroy')
  }

  getTitle () {
    return 'Bug Report'
  }

  getURI () {
    return 'atom://bug-report'
  }

  getIconName () {
    return 'bug'
  }

  isValid () {
    return
      this.title.length > 0 &&
      this.description.length > 0 &&
      this.forPackage.length > 0 &&
      this.osVersion.length > 0
  }

  preview () {
    if (!this.previewFile) {
      this.previewFile = temp.path({suffix: '.md'})
    }

    this.updatePreview()
  }

  renderReport () {
    const reproSteps = this.reproSteps.filter((step) => { return (step && step.length > 0) })
                                      .map((step) => { return `1. ${step}` })
                                      .join('\n')

    console.log(`Repro steps = ${reproSteps}`)

    return `
# ${this.title || 'Untitled Bug Report'}

${this.description}

## Steps to Reproduce

${reproSteps}

**Expected:** ${this.expectedResult}<br/>
**Actual:** ${this.actualResult}<br/>

## Versions

### Atom

\`\`\`
${this.atomVersion}
\`\`\`

### apm

\`\`\`
${this.apmVersion}
\`\`\`

### OS

${this.osVersion}

## Additional Info

${this.additionalInformation}

<details>
### Installed Packages

${this.packageList.map(package => { return `* ${package}` }).join('\n')}

</details>
    `
  }

  report () {
  }

  updatePreview () {
    if (this.previewFile) {
      fs.writeFile(this.previewFile, this.renderReport(), (err) => {
        if (err) {
          throw err
        }

        atom.workspace.open(`markdown-preview://${this.previewFile}`, {searchAllPanes: true})
      })
    }
  }
}
