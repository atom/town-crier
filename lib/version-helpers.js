/** @babel */

import os from 'os'

import {BufferedProcess} from 'atom'

function linuxVersionInfo () {
  return new Promise((resolve, reject) => {
    let stdout = ''

    const lsbRelease = new BufferedProcess({
      command: 'lsb_release',
      args: ['-ds'],
      stdout: (output) => { stdout += output },
      exit: (exitCode) => {
        [DistroName, DistroVersion] = stdout.trim().split(' ')
        resolve({DistroName, DistroVersion})
      }
    })

    lsbRelease.onWillThrowError(({handle}) => {
      handle()
      resolve({})
    })
  })
}

function linuxVersionText () {
  return linuxVersionInfo().then((info) => {
    if (info.DistroName && info.DistroVersion) {
      return `${info.DistroName} ${info.DistroVersion}`
    } else {
      return `${os.platform()} ${os.release()}`
    }
  })
}

function macVersionInfo () {
  return new Promise((resolve, reject) => {
    let stdout = ''
    const plistBuddy = new BufferedProcess({
      command: '/usr/libexec/PlistBuddy',
      args: [
        '-c',
        'Print ProductVersion',
        '-c',
        'Print ProductName',
        '/System/Library/CoreServices/SystemVersion.plist'
      ],
      stdout: (output) => { stdout += output },
      exit: () => {
        [ProductVersion, ProductName] = stdout.trim().split('\n')
        return resolve({ProductVersion, ProductName})
      }
    })

    plistBuddy.onWillThrowError(({handle}) => {
      handle()
      resolve({})
    })
  })
}

function macVersionText () {
  return macVersionInfo().then((info) => {
    if (info.ProductName && info.ProductVersion) {
      return `${info.ProductName} ${info.ProductVersion}`
    } else {
      return 'Unknown macOS version'
    }
  })
}

function winVersionText () {
  return new Promise((resolve, reject) => {
    let data = []
    const systemInfo = new BufferedProcess({
      command: 'systeminfo',
      stdout: (oneLine) => { data.push(oneLine) },
      exit: () => {
        info = data.join('\n')

        if (res = /OS.Name.\s+(.*)$/im.exec(info)) {
          info = res[1]
        } else {
          info = 'Unknown Windows version'
        }

        resolve(info)
      }
    })

    systemInfo.onWillThrowError(({handle}) => {
      handle()
      resolve('Unknown Windows version')
    })
  })
}

module.exports.getApmVersion = async function () {
  return new Promise((resolve, reject) => {
    let stdout = ''
    const apmVersion = new BufferedProcess({
      command: atom.packages.getApmPath(),
      args: ['--version', '--no-color'],
      stdout: (output) => { stdout += output },
      exit: () => {
        resolve(stdout)
      }
    })

    apmVersion.onWillThrowError(({handle}) => {
      handle()
      resolve('Could not get apm version information')
    })
  })
}

module.exports.getAtomVersion = async function () {
  return new Promise((resolve, reject) => {
    resolve(`Atom: ${atom.getVersion()}\nElectron: ${process.versions['atom-shell']}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}`)
  })
}

module.exports.getOsVersion = async function () {
  return new Promise((resolve, reject) => {
    switch (os.platform()) {
      case 'darwin':
        return resolve(macVersionText())

      case 'win32':
        return resolve(winVersionText())

      case 'linux':
        return resolve(linuxVersionText())

      default:
        return resolve(`${os.platform()} ${os.release()}`)
    }
  })
}
