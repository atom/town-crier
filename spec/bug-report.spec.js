/** @babel */

const expect = require('chai').expect

import BugReport from '../lib/bug-report'

describe('BugReport', function () {
  let report

  describe('constructor', function () {
    it('initializes fields to blank values when not deserializing', function () {
      report = new BugReport()

      expect(report.title).to.equal('')
      expect(report.description).to.equal('')
      expect(report.forPackage).to.equal('')
      expect(report.reproSteps).to.have.lengthOf(3)
      expect(report.reproSteps).to.deep.equal(['', '', ''])
      expect(report.expectedResult).to.equal('')
      expect(report.actualResult).to.equal('')
      expect(report.atomVersion).to.equal('')
      expect(report.apmVersion).to.equal('')
      expect(report.osVersion).to.equal('')
      expect(report.additionalInformation.text).to.equal('')
      expect(report.additionalInformation.packageList).to.deep.equal(report.packageList)
    })

    it('copies the values to the fields when deserializing', function () {
      report = new BugReport({
        title: 'foo',
        description: 'bar',
        forPackage: 'baz',
        reproSteps: ['foo', 'bar', 'baz'],
        expectedResult: 'Nothing bad',
        actualResult: 'Something bad',
        additionalInformation: 'Something helpful'
      })

      expect(report.title).to.equal('foo')
      expect(report.description).to.equal('bar')
      expect(report.forPackage).to.equal('baz')
      expect(report.reproSteps).to.deep.equal(['foo', 'bar', 'baz'])
      expect(report.expectedResult).to.equal('Nothing bad')
      expect(report.actualResult).to.equal('Something bad')
      expect(report.additionalInformation).to.equal('Something helpful')
    })
  })

  describe('metadata', function () {
    beforeEach(function () {
      report = new BugReport()
    })

    it('has a title', function () {
      expect(report.getTitle()).to.equal('Bug Report')
    })

    it('has a URI', function () {
      expect(report.getURI()).to.equal('atom://bug-report')
    })

    it('has an icon', function () {
      expect(report.getIconName()).to.equal('bug')
    })
  })

  describe('isValid', function () {
    it('is not valid when first constructed', function () {
      report = new BugReport()

      expect(report.isValid()).to.be.false
    })

    it('is valid when the title, description, package and osVersion are not blank', async function () {
      report = new BugReport({title: 'foo', description: 'bar', forPackage: 'baz'})
      await report.populateVersions()

      expect(report.isValid()).to.be.true
    })
  })

  describe('spinner', function () {
    beforeEach(function () {
      report = new BugReport()
    })

    it('sets the spinner text and class', function () {
      report.spin('foo')

      expect(report.spinnerText).to.equal('foo')
      expect(report.spinnerClass).to.equal('inline-block')
    })

    it('clears the spinner text and sets class to hidden when complete', function () {
      report.spin('foo')
      report.spinComplete()

      expect(report.spinnerText).to.equal('')
      expect(report.spinnerClass).to.equal('inline-block hidden')
    })
  })
})
