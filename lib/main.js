/** @babel */

import {CompositeDisposable} from 'atom'
import {humanizeEventName, humanizeKeystroke} from 'underscore-plus'

function resolveKeys(command) {
  const keybindings = atom.keymaps.findKeyBindings({command})

  if (keybindings.length > 0) {
    return `<kbd class='key-binding'>${humanizeKeystroke(keybindings[0].keystrokes)}</kbd>`
  } else {
    return humanizeEventName(command)
  }
}

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
        const keytar = require('keytar')

        if (keytar.findPassword('atom-github')) {
          atom.workspace.open('town-crier://bug-report')
        } else {
          atom.notifications.addWarning('Sign in required', {
            description: `First sign in using the GitHub package by using ${resolveKeys('github:toggle-github-tab')} to display the GitHub panel`,
            dismissable: true
          })
        }
      }
    }))
  },

  deactivate: function () {
    if (this.disposables) {
      this.disposables.dispose()
      this.disposables = null
    }
  },

  deserializeBugReport: function ({data}) {
    const BugReport = require('./bug-report')

    return new BugReport(data)
  }
}
