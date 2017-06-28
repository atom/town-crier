/** @babel */

import {CompositeDisposable, Emitter} from 'atom'
import fs from 'fs'
import keytar from 'keytar'
import temp from 'temp'

import AtomApi from './atom-api'
import BugReportView from './bug-report-view'
import {getApmVersion, getAtomVersion, getOsVersion} from './version-helpers'

const GitHubApi = require('github')

const packageMetadata = require('../package.json')

export default class BugReport {
  constructor (data = {}) {
    this.title = data.title || ''
    this.description = data.description || ''
    this.forPackage = data.forPackage || ''
    this.reproSteps = data.reproSteps || ['', '', '']
    this.expectedResult = data.expectedResult || ''
    this.actualResult = data.actualResult || ''
    this.atomVersion = ''
    this.apmVersion = ''
    this.osVersion = ''
    this.additionalInformation = data.additionalInformation || ''
    this.spinnerText = ''
    this.spinnerClass = 'inline-block hidden'

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

  serialize () {
    return {
      deserializer: 'BugReport',
      data: {
        title: this.title,
        description: this.description,
        forPackage: this.forPackage,
        reproSteps: this.reproSteps,
        expectedResult: this.expectedResult,
        actualResult: this.actualResult,
        additionalInformation: this.additionalInformation
      }
    }
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
    const isValid = this.title.trim().length > 0 && this.description.trim().length > 0 && this.forPackage.length > 0 && this.osVersion.trim().length > 0

    return isValid
  }

  preview () {
    if (!this.previewFile) {
      this.previewFile = temp.path({suffix: '.md'})
    }

    this.updatePreview(true)
  }

  spin (text) {
    this.spinnerText = text
    this.spinnerClass = 'inline-block'

    this.view.update(this)
  }

  spinComplete () {
    this.spinnerText = ''
    this.spinnerClass = 'inline-block hidden'

    this.view.update(this)
  }

  renderReport ({withHeader} = {withHeader: false}) {
    const reproSteps = this.reproSteps.filter((step) => { return (step && step.length > 0) })
                                      .map((step) => { return `1. ${step}` })
                                      .join('\n')

    let header = ''
    if (withHeader) {
      header = `
> **For package:** ${this.forPackage || 'No package selected'}

# ${this.title || 'Untitled Bug Report'}
`
    }

    return `
${header}

${this.description}

## Steps to Reproduce

${reproSteps}

**Expected:** ${this.expectedResult || 'None entered'}<br/>
**Actual:** ${this.actualResult || 'None entered'}<br/>

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

<summary>Installed Packages</summary>

${this.packageList.map(package => { return `* ${package}` }).join('\n')}

</details>

<!-- Created by town-crier v${packageMetadata.version} -->
    `
  }

  async submit () {
    try {
      this.spin(`Fetch repository info for ${this.forPackage}`)
      const atomApi = new AtomApi()
      const repoUrl = await atomApi.getPackageRepo(this.forPackage)
      const [text, owner, repo] = repoUrl.match(/https:\/\/github.com\/([^\/]+)\/([^\/]+)/)

      this.spin('Retrieve GitHub API token')
      const token = await keytar.getPassword('atom-github', 'https://api.github.com')

      this.spin('Authenticate as current user')
      const github = new GitHubApi({})
      await github.authenticate({type: 'oauth', token})

      this.spin(`Submit issue to ${repoUrl}`)
      await github.issues.create({owner, repo, title: this.title, body: this.renderReport()})
    } catch (e) {
      atom.notifications.addError('Error submitting bug', {
        detail: e.message,
        dismissable: true
      })
    } finally {
      this.spinComplete()
    }
  }

  updatePreview (activateItem = false) {
    if (this.previewFile) {
      fs.writeFile(this.previewFile, this.renderReport({withHeader: true}), (err) => {
        if (err) {
          throw err
        }

        atom.workspace.open(`markdown-preview://${this.previewFile}`, {searchAllPanes: true, activateItem})
      })
    }
  }
}
