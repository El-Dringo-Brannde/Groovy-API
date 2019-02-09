const { assert } = require('chai')

const Groov = require('../src/index')

describe('Groovy Tester', () => {
	describe('Constructor  fail', () => {
		it('Should detect lack of credentials', async () => {
			const fail = () => new Groov(); 
			assert.throws(fail,'Did not provide credentials')
			})
	})
	
	describe('Login Partner Test', () => {
		it('Should properly login the user', async () => {
			let pandora = new Groov(process.env.EMAIL, process.env.PASSWORD)
			await pandora.login()
			assert.isNotNull(pandora.partner)
			
		})
	})

	describe('Login User Test', () => {
		it('Should properly login the user', async () => {
			let pandora = new Groov(process.env.EMAIL, process.env.PASSWORD)
			await pandora.login()
			assert.isNotNull(pandora.user)		
		})
	})

	describe('Request test', () => {
		it('Shoud make a successful request', async () => {
			let pandora = new Groov(process.env.EMAIL, process.env.PASSWORD)
			await pandora.login()
			const result = await pandora.request('user.getStationList')
			assert.equal(result.stat, 'ok')
		})
	})
})