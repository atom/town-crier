/** @babel */

import {CompositeDisposable} from 'atom'

module.exports = {
  activate: function () {
    this.disposables = new CompositeDisposable()

    this.disposables.add(atom.workspace.addOpener((uri) => {
      if (uri === 'town-crier://bug-report') {
        const BugReport = require('./bug-report')

        return new BugReport()
      }
    }))

    this.disposables.add(atom.commands.add('atom-workspace', {
      'town-crier:create-bug': () => {
        atom.workspace.open('town-crier://bug-report')
      }
    }))
  },

  deactivate: function () {
    if (this.disposables) {
      this.disposables.dispose()
      this.disposables = null
    }
  }
}
