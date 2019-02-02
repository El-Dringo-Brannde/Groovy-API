let request = require('request-promise');

const queryString = require('querystring');
const partnerAuth = require('./config/partnerAuth');

const ENDPOINT = `https://tuner.pandora.com/services/json/`;

class Groovy {
	constructor(username, password) {
		this.username = username;
		this.password = password;
	}

	async login() {
		const partner = await this._partnerLogin();
		console.log(partner);
	}

	async _partnerLogin() {
		let result;
		try {
			result = await request.post(ENDPOINT, {
				qs: {
					method: 'auth.partnerLogin'
				},
				body: JSON.stringify(partnerAuth)
			});
			result = result;
		} catch (err) {
			throw `Unable to use Partner Authentication ${err}`;
		}
		return JSON.parse(result);
	}

	async _userLogin() {}

	_seconds() {
		return (Date.now() / 1000) | 0;
	}
}

let Groov = new Groovy('Brandon.d.junk@gmail.com', 'Beandip95');
Groov.login();
