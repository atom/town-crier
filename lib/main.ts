import {CompositeDisposable} from 'atom'
import {humanizeEventName, humanizeKeystroke} from 'underscore-plus'

import BugReport from './bug-report'

let disposables: CompositeDisposable

function resolveKeys(command: string) {
  const keybindings = atom.keymaps.findKeyBindings({command})

  if (keybindings.length > 0) {
    return `<kbd class='key-binding'>${humanizeKeystroke(keybindings[0].keystrokes)}</kbd>`
  } else {
    return humanizeEventName(command)
  }
}

export function activate() {
  disposables = new CompositeDisposable()

  disposables.add(atom.workspace.addOpener((uri) => {
    if (uri === 'town-crier://bug-report') {
      const BugReport = require('./bug-report')

      return new BugReport()
    }
  }))

  disposables.add(atom.commands.add('atom-workspace', {
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
}

export function deactivate() {
  if (disposables) {
    disposables.dispose()
  }
}

export function deserializeBugReport({data}: any) {
  const BugReport = require('./bug-report')

  return new BugReport(data)
}
