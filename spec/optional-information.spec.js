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
      expect(info.getInfo('foo').data).to.be.null
      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
    })

    it('adds a type and data', function () {
      info.setInfo('foo', 'bar')

      expect(info.getTypes()).to.deep.equal(['foo'])
      expect(info.getInfo('foo').data).to.equal('bar')
      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
    })

    it('adds a type, data, and an optional description', function () {
      info.setInfo('foo', 'bar', {description: 'description'})

      expect(info.getTypes()).to.deep.equal(['foo'])
      expect(info.getInfo('foo').data).to.equal('bar')
      expect(info.getIncludeTypes()).to.deep.equal(['foo'])
      expect(info.getDescription('foo')).to.equal('description')
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

  describe('getDescription', function () {
    beforeEach(function () {
      info = new OptionalInformation()

      info.setInfo('fooBarBaz')
    })

    it('defaults to title casing the type name', function () {
      expect(info.getDescription('fooBarBaz')).to.equal('Foo Bar Baz')
    })

    it('gives the manually supplied description when it exists', function () {
      info.setInfo('fooBar', 'blah', {description: 'An extended description'})

      expect(info.getDescription('fooBar')).to.equal('An extended description')
    })
  })

  describe('renderData', function () {
    beforeEach(function () {
      info = new OptionalInformation()

      info.setInfo('string', 'Some text')
      info.setInfo('arrayOfStrings', ['some', 'text', 'in', 'here'])
    })

    it('renders a string as just the String', function () {
      expect(info.renderData('string')).to.equal('Some text')
    })

    it('renders an array of strings as an unordered list', function () {
      expect(info.renderData('arrayOfStrings')).to.equal('* some\n* text\n* in\n* here\n')
    })
  })
})
