/** @babel */

import {CompositeDisposable, Emitter} from 'atom'
import fs from 'fs'
import keytar from 'keytar'
import temp from 'temp'

import AtomApi from './atom-api'
import BugReportView from './bug-report-view'
import OptionalInformation from './optional-information'
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
    this.atomVersion = data.atomVersion || ''
    this.apmVersion = data.apmVersion || ''
    this.osVersion = data.osVersion || ''
    this.additionalInformation = data.additionalInformation || ''
    this.optionalInformation = new OptionalInformation()

    this.spinnerText = ''

    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.packageList = atom.packages.getAvailablePackageNames()
    this.optionalInformation.setInfo('packageList', this.packageList, {description: 'Installed Package List'})

    if (atom.inDevMode()) {
      this.packageList.push('test-creating-issues-here')
    }

    if (this.atomVersion === '' || this.apmVersion === '' || this.osVersion === '') {
      this.populateVersions()
    }
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

  addReproStep () {
    this.reproSteps.push('')

    this.view.update(this)
  }

  removeReproStep (index) {
    this.reproSteps.splice(index, 1)

    this.view.update(this)
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

  async populateVersions () {
    return Promise.all([getAtomVersion(), getApmVersion(), getOsVersion()]).then(values => {
      this.atomVersion = values[0]
      this.apmVersion = values[1]
      this.osVersion = values[2]

      this.view.update(this)
    })
  }

  preview () {
    if (!this.previewFile) {
      this.previewFile = temp.path({suffix: '.md'})
    }

    this.updatePreview(true)
  }

  spin (text) {
    this.spinnerText = text

    this.view.update(this)
  }

  spinComplete () {
    this.spinnerText = ''

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

${this.renderOptionalInformation()}

<!-- Created by town-crier v${packageMetadata.version} -->
    `
  }

  renderOptionalInformation () {
    if (this.optionalInformation.getIncludeTypes().length > 0) {
      let blocks = ''

      for (let type of this.optionalInformation.getIncludeTypes()) {
        blocks += `
<details>
<summary>${this.optionalInformation.getDescription(type)}</summary>
${this.optionalInformation.renderData(type)}
</details>
        `
      }

      return `
## Optional Information

${blocks}
      `
    }
  }

  async submit () {
    try {
      let owner, repo, repoUrl

      if (this.forPackage === 'atom') {
        owner = 'atom'
        repo = 'atom'
        repoUrl = 'https://github.com/atom/atom/'
      } else if (this.forPackage === 'test-creating-issues-here') {
        [owner, repo] = process.env.TOWN_CRIER_TEST_REPO.split('/')
        repoUrl = `https://github.com/${process.env.TOWN_CRIER_TEST_REPO}/`
      } else {
        this.spin(`Fetch repository info for ${this.forPackage}`)
        const atomApi = new AtomApi()
        repoUrl = await atomApi.getPackageRepo(this.forPackage)

        let text
        [text, owner, repo] = repoUrl.match(/https:\/\/github.com\/([^\/]+)\/([^\/]+)/)
      }

      this.spin('Retrieve GitHub API token')
      const token = await keytar.getPassword('atom-github', 'https://api.github.com')

      this.spin('Authenticate as current user')
      const github = new GitHubApi({})
      await github.authenticate({type: 'oauth', token})

      this.spin(`Submit issue to ${repoUrl}`)
      const issue = await github.issues.create({owner, repo, title: this.title, body: this.renderReport()})

      const {shell} = require('electron')
      shell.openExternal(issue.data.html_url)
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
