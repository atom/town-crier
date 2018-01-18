import * as _ from 'underscore-plus'

interface OptionalInformationMap {
  [key: string]: OptionalInformationBlock
}

interface OptionalInformationBlock {
  description: string | undefined
  data: StringOrStrings
  include: boolean
}

type StringOrStrings = string | string[]

/**
 * Keeps track of optional information and whether to include it in the issue to be filed.
 */
export default class OptionalInformation {
  private info: OptionalInformationMap

  constructor () {
    this.info = {}
  }

  getDescription (type: string) {
    if (this.info[type] && this.info[type].description) {
      return this.info[type].description
    }

    return _.uncamelcase(type)
  }

  /**
   * Get the list of types of information to be included.
   *
   * @return {Array<String>} List of information names.
   */
  getIncludeTypes () {
    let types = []

    for (let type of this.getTypes()) {
      if (this.info[type].include) {
        types.push(type)
      }
    }

    return types
  }

  /**
   * Get the information associated with the given name.
   *
   * @param {String} type Name of the information type
   * @return Information associated with the name
   */
  getInfo (type: string) {
    return this.info[type]
  }

  /**
   * Gets the types of optional information stored.
   *
   * @return {Array<String>} List of types of optional information
   */
  getTypes () {
    return Object.keys(this.info)
  }

  renderData (type: string) {
    if (this.info[type] && this.info[type].data) {
      let data = this.info[type].data

      if (data instanceof Array) {
        return data.reduce((acc, val) => { return acc + `* ${val}\n` }, '')
      } else {
        return data
      }
    } else {
      return ''
    }
  }

  /**
   * Set the inclusion flag for a specific information type.
   *
   * @param {String} type Name of the information type
   * @param {Boolean} include Flag indicating whether to include the information type in the issue
   */
  setInclude (type: string, include: boolean) {
    this.info[type].include = include
  }

  /**
   * Set information in the collection.
   *
   * @param {String} type Name of the information
   * @param [data=null] The information
   */
  setInfo (type: string, data: any = null, {description}: {description?: string} = {}) {
    this.info[type] = { data, description, include: true }
  }
}
