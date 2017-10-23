/* eslint-env mocha */

const expect = require('expect')
const {createRobot} = require('probot')
const payload = require('./fixtures/payload')
const _ = require('underscore')
_.mixin(require('underscore.deepclone'))

const whitelistedPayload = _.deepClone(payload)
whitelistedPayload.payload.pull_request.title = whitelistedPayload.payload.pull_request.title + ' chore'

const app = require('..')

describe('update-changelog', () => {
  let robot
  let github

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot()
    // Here we initialize the app on the robot instance
    app(robot)
    // This is an easy way to mock out the GitHub API
    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from('whiteList:\n - chore').toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy()
      },
      pullRequests: {
        getFiles: expect.createSpy().andReturn(Promise.resolve({
          data: [{filename: 'help.yml'}, {filename: 'index.js'}]
        }))
      }
    }
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github)
  })

  describe('update CHANGELOG success', () => {
    it('posts a comment because the user did NOT update the CHANGELOG', async () => {
      await robot.receive(payload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })
      expect(github.issues.createComment).toHaveBeenCalled()
    })
  })

  describe('update CHANGELOG skip - whitelist', () => {
    it('does not post a comment because while the user did not update the CHANGELOG, it has a whitelisted description', async () => {
      await robot.receive(whitelistedPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })
      expect(github.issues.createComment).toHaveBeenCalled()
    })
  })

  describe('update CHANGELOG skip - file', () => {
    beforeEach(() => {
      github.pullRequests.getFiles = expect.createSpy().andReturn(Promise.resolve({
        data: [{filename: '/lib/main.js'}, {filename: 'CHANGELOG.md'}]
      }))
    })

    it('does not post a comment because the user DID update the CHANGELOG', async () => {
      await robot.receive(payload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        number: 21
      })
      expect(github.repos.getContent).toNotHaveBeenCalled()
      expect(github.issues.createComment).toNotHaveBeenCalled()
    })
  })
})
