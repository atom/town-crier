/** @babel */

import OptionalInformation from '../lib/optional-information'

describe('OptionalInformation', function () {
  let info

  describe('constructor', function () {
    it('creates an empty collection', function () {
      info = new OptionalInformation()

      expect(info.getTypes()).to.deep.equal([])
    })
  })

  describe('setInfo', function () {
    beforeEach(function () {
      info = new OptionalInformation()
    })

    it('adds a type of info when not given any data', function () {
      info.setInfo('foo')

      expect(info.getTypes()).to.deep.equal(['foo'])
      expect(info.getInfo('foo')).to.be.null
      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
    })

    it('adds a type and data', function () {
      info.setInfo('foo', 'bar')

      expect(info.getTypes()).to.deep.equal(['foo'])
      expect(info.getInfo('foo')).to.equal('bar')
      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
    })
  })

  describe('setInclude', function () {
    beforeEach(function () {
      info = new OptionalInformation()

      info.setInfo('foo')
    })

    it('clears the type from being included when set to false', function () {
      info.setInclude('foo', false)

      expect(info.getIncludeTypes()).to.deep.equal([])
    })

    it('adds the type to the included list when set to true', function () {
      info.setInclude('foo', false)
      info.setInclude('foo', true)

      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
    })
  })
})
