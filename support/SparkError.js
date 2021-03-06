const http = require('http')

const _ = require('lodash')

const log = require('./log.js')

class SparkError extends Error {

	static async fromResponse (response) {
		const statusMessage = SparkError.statusMessage(response)
		const body = await response.json().catch(() => null)
		const details = _.get(body, 'message', statusMessage)
		const tracking = _.get(body, 'trackingId', 'missing')
		const message = `(tracking ID: ${tracking}) ${details}`
		log.debug('Error from Spark %s', message) // too much logging?
		return Object.assign(new SparkError(message), { body, response })
	}

	static async retryAfter (header, retry) {
		const seconds = Number(header) || 0 // default: no wait
		log.debug('Scheduled retry after: %s (seconds)', seconds)
		await new Promise(done => setTimeout(done, seconds * 1000))
		return retry()
	}

	static statusMessage ({ status }) {
		return _.get(http.STATUS_CODES, status, 'Unknown')
	}

}

module.exports = SparkError
