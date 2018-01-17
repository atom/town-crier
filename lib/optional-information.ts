/// <reference path="./types/underscore-plus" />

import * as _ from 'underscore-plus'

interface OptionalInformationMap {
  [key: string]: OptionalInformationBlock
}

interface OptionalInformationBlock {
  description?: string
  data: StringOrStrings
  include: boolean
}

type StringOrStrings = string | string[]

/**
 * Keeps track of optional information and whether to include it in the issue to be filed.
 */
export default class OptionalInformation {
  private info: OptionalInformationMap

  public constructor () {
    this.info = {}
  }

  public getDescription(type: string): string {
    return this.info[type].description || _.uncamelcase(type)
  }

  /**
   * Get the list of types of information to be included.
   *
   * @return {Array<String>} List of information names.
   */
  public getIncludeTypes(): string[] {
    return this.getTypes().filter((type) => { this.info[type].include })
  }

  /**
   * Get the information associated with the given name.
   */
  public getInfo(type: string): OptionalInformationBlock {
    return this.info[type]
  }

  /**
   * Gets the types of optional information stored.
   */
  public getTypes(): string[] {
    return Object.keys(this.info)
  }

  public renderData(type: string): string {
    if (this.info[type] && this.info[type].data) {
      let data = this.info[type].data

      if (data instanceof Array) {
        return data.reduce((acc: string, val: string) => { return acc + `* ${val}\n` }, '')
      } else {
        return data
      }
    } else {
      return ''
    }
  }

  /**
   * Set the inclusion flag for a specific information type.
   */
  public setInclude(type: string, include: boolean) {
    this.info[type].include = include
  }

  /**
   * Set information in the collection.
   */
  public setInfo(type: string, data: any = null, {description} = {description: undefined}): void {
    this.info[type] = { data, description, include: true }
  }
}
