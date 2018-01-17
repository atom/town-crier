import * as https from 'https'
import * as url from 'url'

/**
 * Response from the package details Atom API call.
 *
 * See http://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api/#showing-package-details
 */
interface PackageResponse {
  name: string
  repository: {
    type: string
    url: string
  }
}

export default class AtomApi {
  /**
   * Gets the repository URL for the given package name.
   */
  public async getPackageRepo(packageName: string): Promise<string> {
    let options = url.parse(`https://atom.io/api/packages/${packageName}`)
    options = Object.assign(options, {headers: {"Accept": "application/json"}})

    return new Promise((resolve: (repo: string) => void, reject) => {
      https.get(options, (response) => {
        let body = ''

        response.on('data', (d) => {
          body += d
        })

        response.on('end', () => {
          try {
            if (response.statusCode === 200) {
              const parsed = JSON.parse(body) as PackageResponse
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

  private getRepo (response: PackageResponse): string | undefined {
    if (response.repository && typeof response.repository === 'string') {
      return response.repository
    } else if (response.repository.url && typeof response.repository.url === 'string') {
      return response.repository.url
    }
  }
}
