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
	}

	async login() {
		this.partner = await this._partnerLogin();
		this.user = await this._userLogin();
	}

	async request(method, data = {}) {
		if (!this.partner && !this.user)
			throw new Error(`Please authenicate with login() before making requests`)
		
		data = this._buildRequestBody(data)
		
		let res = await request.post(ENDPOINT, {
			qs: {
				method: method,
				auth_token: this.user.result.userAuthToken,
				partner_id: this.partner.partnerId,
				user_id: this.user.result.userId
			},
			body: this._encryptBody(data)
		})
		this._checkRequestStatus(res, method)
		return JSON.parse(res)
	}

	async _partnerLogin() {
		let res = await request.post(ENDPOINT, {
			qs: {
				method: 'auth.partnerLogin'
			},
			body: JSON.stringify(partnerAuth)
		});
		res = JSON.parse(res);
		this._checkRequestStatus(res, 'partnerLogin')

		res.result.syncTimeOffset =
			this._decryptSyncTime(res.result.syncTime) - this._seconds;

		return res.result;
	}

	async _userLogin() {
		let res = await request.post(ENDPOINT, {
			qs: {
				method: 'auth.userLogin',
				auth_token: this.partner.partnerAuthToken,
				partner_id: this.partner.partnerId
			},
			body: this._userLoginBody
		});
		return this._checkRequestStatus(JSON.parse(res), 'userLogin');
	}

	_checkRequestStatus(json, method) {
		if (json.stat != 'ok') throw new Error(`Unable to perform request on method ${method}, please try again`)
		else return json
	}

	_buildRequestBody(body) {
		const auth = { userAuthToken: this.user.result.userAuthToken, syncTime: this.partner.syncTimeOffset + this._seconds}
		return  {...body, ...auth }
	}

	_encryptBody(body) {
		return encrypt(
			JSON.stringify(body)
		)
			.toString('hex')
			.toLowerCase()
	}

	get _userLoginBody() {
		return encrypt(
			JSON.stringify({
				loginType: 'user',
				username: this.username,
				password: this.password,
				partnerAuthToken: this.partner.partnerAuthToken,
				syncTime: this.partner.syncTimeOffset + this._seconds
			})
		)
			.toString('hex')
			.toLowerCase()
	}

	get _seconds() {
		return (Date.now() / 1000) | 0;
	}

	_decryptSyncTime(ciphered) {
		return parseInt(decrypt(ciphered).toString('utf8', 4, 14), 10);
	}
}