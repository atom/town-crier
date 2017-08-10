/** @babel */

/**
 * Keeps track of optional information and whether to include it in the issue to be filed.
 */
export default class OptionalInformation {
  constructor () {
    this.info = {}
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
  getInfo (type) {
    return this.info[type].data
  }

  /**
   * Gets the types of optional information stored.
   *
   * @return {Array<String>} List of types of optional information
   */
  getTypes () {
    return Object.keys(this.info)
  }

  /**
   * Set the inclusion flag for a specific information type.
   *
   * @param {String} type Name of the information type
   * @param {Boolean} include Flag indicating whether to include the information type in the issue
   */
  setInclude (type, include) {
    this.info[type].include = include
  }

  /**
   * Set information in the collection.
   *
   * @param {String} type Name of the information
   * @param [data=null] The information
   */
  setInfo (type, data = null) {
    this.info[type] = { data, include: true }
  }
}
