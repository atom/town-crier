/** @babel */

const expect = require('chai').expect
import sinon from 'sinon'

import BugReport from '../lib/bug-report'

describe('BugReport', function () {
  let report

  describe('constructor', function () {
    let devModeStub

    beforeEach(function () {
      devModeStub = sinon.stub(atom, 'inDevMode')
      devModeStub.returns(false)
    })

    afterEach(function () {
      devModeStub.restore()
    })

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
      expect(report.packageList).to.deep.equal(atom.packages.getAvailablePackageNames())
      expect(report.additionalInformation).to.equal('')
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

    it('adds a test package name when in dev mode', function () {
      devModeStub.returns(true)

      report = new BugReport()

      const packages = atom.packages.getAvailablePackageNames()
      packages.push('test-creating-issues-here')

      expect(report.packageList).to.deep.equal(packages)
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
      report = new BugReport({
        title: 'foo',
        description: 'bar',
        forPackage: 'baz',
        osVersion: 'Mac OS X 10.12.5'
      })

      expect(report.isValid()).to.be.true
    })
  })

  describe('serialization', function () {
    let state

    beforeEach(function () {
      report = new BugReport({atomVersion: 'foo', apmVersion: 'bar', osVersion: 'baz'})
      state = report.serialize()
    })

    it('does not serialize the atom version information', function () {
      expect(state.data.atomVersion).to.not.exist
    })

    it('does not serialize the apm version information', function () {
      expect(state.data.apmVersion).to.not.exist
    })

    it('does not serialize the os version information', function () {
      expect(state.data.osVersion).to.not.exist
    })
  })

  describe('spinner', function () {
    beforeEach(function () {
      report = new BugReport()
    })

    it('sets the spinner text', function () {
      report.spin('foo')

      expect(report.spinnerText).to.equal('foo')
    })

    it('clears the spinner text when complete', function () {
      report.spin('foo')
      report.spinComplete()

      expect(report.spinnerText).to.equal('')
    })
  })

  describe('reproSteps', function () {
    beforeEach(function () {
      report = new BugReport()
    })

    it('adds a repro step when addReproStep is called', function () {
      expect(report.reproSteps.length).to.equal(3)

      report.addReproStep()

      expect(report.reproSteps.length).to.equal(4)
      expect(report.reproSteps[3]).to.equal('')
    })

    it('removes a repro step when removeReproStep is called', function () {
      report.reproSteps = ['foo', 'bar', 'baz']

      report.removeReproStep(0)

      expect(report.reproSteps).to.deep.equal(['bar', 'baz'])
    })
  })

  describe('renderReport', function () {
    let rendered

    describe('empty report', function () {
      beforeEach(function () {
        report = new BugReport()
      })

      describe('with no header', function () {
        beforeEach(function () {
          rendered = report.renderReport()
        })

        it('has only whitespace before the repro steps section', function () {
          expect(rendered).to.match(/^\s+## Steps to Reproduce/)
        })

        it('has only whitespace between the steps to reproduce header and expected behavior', function () {
          expect(rendered).to.match(/## Steps to Reproduce\s+\*\*Expected:\*\*/)
        })

        it('has the default text for expected', function () {
          expect(rendered).to.match(/\*\*Expected:\*\* None entered/)
        })

        it('has the default text for actual', function () {
          expect(rendered).to.match(/\*\*Actual:\*\* None entered/)
        })

        it('has only whitespace between the additional information header and the optional information section', function () {
          expect(rendered).to.match(/## Additional Info\s+## Optional Information/)
        })

        it('contains the town-crier version comment', function () {
          expect(rendered).to.match(/<!-- Created by town-crier v\d+\.\d+\.\d+ -->/)
        })
      })

      describe('with header', function () {
        beforeEach(function () {
          rendered = report.renderReport({withHeader: true})
        })

        it('includes default text for the selected package', function () {
          expect(rendered).to.match(/\*\*For package:\*\* No package selected/)
        })

        it('includes the bug title', function () {
          expect(rendered).to.match(/# Untitled Bug Report/)
        })

        it('has only whitespace between the steps to reproduce header and expected behavior', function () {
          expect(rendered).to.match(/## Steps to Reproduce\s+\*\*Expected:\*\*/)
        })

        it('has the default text for expected', function () {
          expect(rendered).to.match(/\*\*Expected:\*\* None entered/)
        })

        it('has the default text for actual', function () {
          expect(rendered).to.match(/\*\*Actual:\*\* None entered/)
        })

        it('has only whitespace between the additional information header and the optional information section', function () {
          expect(rendered).to.match(/## Additional Info\s+## Optional Information/)
        })

        it('contains the town-crier version comment', function () {
          expect(rendered).to.match(/<!-- Created by town-crier v\d+\.\d+\.\d+ -->/)
        })
      })
    })

    describe('populated report', function () {
      beforeEach(function () {
        report = new BugReport({
          title: 'Title',
          description: 'Description',
          forPackage: 'atom',
          expectedResult: 'Expected',
          actualResult: 'Actual',
          reproSteps: ['one', 'two', 'three'],
          additionalInformation: 'Additional information'
        })
      })

      describe('without header', function () {
        beforeEach(function () {
          rendered = report.renderReport()
        })

        it('contains the description before the repro steps section', function () {
          expect(rendered).to.match(/Description\s+## Steps to Reproduce/)
        })

        it('contains the repro steps before the expected result', function () {
          expect(rendered).to.match(/## Steps to Reproduce\s+1\. one\n1\. two\n1\. three\s+\*\*Expected:\*\*/)
        })

        it('has the proper text for expected', function () {
          expect(rendered).to.match(/\*\*Expected:\*\* Expected/)
        })

        it('has the proper text for actual', function () {
          expect(rendered).to.match(/\*\*Actual:\*\* Actual/)
        })

        it('has the proper text between the additional information header and the optional information section', function () {
          expect(rendered).to.match(/## Additional Info\s+Additional information\s+## Optional/)
        })

        it('contains the town-crier version comment', function () {
          expect(rendered).to.match(/<!-- Created by town-crier v\d+\.\d+\.\d+ -->/)
        })
      })

      describe('with header', function () {
        beforeEach(function () {
          rendered = report.renderReport({withHeader: true})
        })

        it('contains the named package', function () {
          expect(rendered).to.match(/\*\*For package:\*\* atom/)
        })

        it('contains the bug title', function () {
          expect(rendered).to.match(/# Title/)
        })

        it('contains the description before the repro steps section', function () {
          expect(rendered).to.match(/Description\s+## Steps to Reproduce/)
        })

        it('contains the repro steps before the expected result', function () {
          expect(rendered).to.match(/## Steps to Reproduce\s+1\. one\n1\. two\n1\. three\s+\*\*Expected:\*\*/)
        })

        it('has the proper text for expected', function () {
          expect(rendered).to.match(/\*\*Expected:\*\* Expected/)
        })

        it('has the proper text for actual', function () {
          expect(rendered).to.match(/\*\*Actual:\*\* Actual/)
        })

        it('has the proper text between the additional information header and the optional information section', function () {
          expect(rendered).to.match(/## Additional Info\s+Additional information\s+## Optional Information/)
        })

        it('contains the town-crier version comment', function () {
          expect(rendered).to.match(/<!-- Created by town-crier v\d+\.\d+\.\d+ -->/)
        })
      })
    })
  })
})
