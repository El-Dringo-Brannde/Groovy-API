let request = require('request-promise');

const partnerAuth = require('./config/partnerAuth');

const { encrypt, decrypt } = require('./encryption');

const ENDPOINT = `https://tuner.pandora.com/services/json/`;

class Groovy {
	constructor(username, password) {
		this.username = username;
		this.password = password;
		this.user;
		this.partner;
		this.client;
	}

	async login() {
		this.partner = await this._partnerLogin();
		this.user = await this._userLogin();
		console.log(this.user);
	}

	async _partnerLogin() {
		let res = await request.post(ENDPOINT, {
			qs: {
				method: 'auth.partnerLogin'
			},
			body: JSON.stringify(partnerAuth)
		});
		res = JSON.parse(res);
		if (res.stat !== 'ok') throw `Unable to authenicate with partnerLogin`;

		res.result.syncTimeOffset =
			this._decryptSyncTime(res.result.syncTime) - this._seconds();

		return res.result;
	}

	async _userLogin() {
		let res = await request.post(ENDPOINT, {
			qs: {
				method: 'auth.userLogin',
				auth_token: this.partner.partnerAuthToken,
				partner_id: this.partner.partner_id
			},
			body: encrypt(
				JSON.stringify({
					loginType: 'user',
					username: this.username,
					password: this.password,
					partnerAuthToken: this.partner.partnerAuthToken,
					syncTime: this.partner.syncTimeOffset + this._seconds()
				})
			)
				.toString('hex')
				.toLowerCase()
		});
		return JSON.parse(res);
	}

	_decryptSyncTime(ciphered) {
		return parseInt(decrypt(ciphered).toString('utf8', 4, 14), 10);
	}

	_seconds() {
		return (Date.now() / 1000) | 0;
	}
}

let Groov = new Groovy('Brandon.d.junk@gmail.com', 'Beandip95');
Groov.login();
