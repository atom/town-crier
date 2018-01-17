import * as os from 'os'

import {BufferedProcess} from 'atom'

interface LinuxVersionInfo {
  distroName?: string
  distroVersion?: string
}

interface MacVersionInfo {
  productName?: string
  productVersion?: string
}

async function linuxVersionInfo(): Promise<LinuxVersionInfo> {
  return new Promise((resolve: (info: LinuxVersionInfo) => void, reject) => {
    let stdout = ''

    const lsbRelease = new BufferedProcess({
      command: 'lsb_release',
      args: ['-ds'],
      stdout: (output) => { stdout += output },
      exit: (exitCode) => {
        let [distroName, distroVersion] = stdout.trim().split(' ')
        resolve({distroName, distroVersion})
      }
    })

    lsbRelease.onWillThrowError(({handle}) => {
      handle()
      resolve({})
    })
  })
}

async function linuxVersionText(): Promise<string> {
  let info = await linuxVersionInfo()

  if (info.distroName && info.distroVersion) {
    return `${info.distroName} ${info.distroVersion}`
  } else {
    return `${os.platform()} ${os.release()}`
  }
}

async function macVersionInfo(): Promise<MacVersionInfo> {
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
        let [productVersion, productName] = stdout.trim().split('\n')
        return resolve({productVersion, productName})
      }
    })

    plistBuddy.onWillThrowError(({handle}) => {
      handle()
      resolve({})
    })
  })
}

async function macVersionText(): Promise<string> {
  let info = await macVersionInfo()

  if (info.productName && info.productVersion) {
    return `${info.productName} ${info.productVersion}`
  } else {
    return 'Unknown macOS version'
  }
}

async function winVersionText(): Promise<string> {
  return new Promise((resolve: (info: string) => void, reject) => {
    let data: string[] = []
    const systemInfo = new BufferedProcess({
      command: 'systeminfo',
      stdout: (oneLine) => { data.push(oneLine) },
      exit: () => {
        let info = data.join('\n')
        let res = /OS.Name.\s+(.*)$/im.exec(info)

        if (res) {
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

export async function getApmVersion(): Promise<string> {
  return new Promise((resolve: (version: string) => void, reject) => {
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

export async function getAtomVersion(): Promise<string> {
  return `Atom: ${atom.getVersion()}\nElectron: ${process.versions['atom-shell']}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}`
}

export async function getOsVersion(): Promise<string> {
  switch (os.platform()) {
    case 'darwin':
      return await macVersionText()

    case 'win32':
      return await winVersionText()

    case 'linux':
      return await linuxVersionText()

    default:
      return `${os.platform()} ${os.release()}`
  }
}
