/** @babel */

import https from 'https'
import url from 'url'

export default class AtomApi {
  async getPackageRepo (packageName) {
    let options = url.parse(`https://atom.io/api/packages/${packageName}`)
    options = Object.assign(options, {headers: {"Accept": "application/json"}})

    return new Promise((resolve, reject) => {
      https.get(options, (response) => {
        let body = ''

        response.on('data', (d) => {
          body += d
        })

        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const parsed = JSON.parse(body)
              const repo = this.getRepo(parsed)

              if (repo) {
                resolve(repo)
              } else {
                reject(new Error(`Could not determine repo URL from: ${body}\nStatus code: ${response.statusCode}`))
              }
            } else {
              reject(new Error(`Could not find the package '${packageName}'\nStatus code: ${response.statusCode}`))
            }
          } catch (e) {
            reject(e)
          }
        })
      })
    })
  }

  getRepo (obj) {
    if (obj.repository && typeof obj.repository === 'string') {
      return obj.repository
    } else if (obj.repository.url && typeof obj.repository.url === 'string') {
      return obj.repository.url
    }
  }
}
