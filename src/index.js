let axios = require('axios');

const partnerAuth = require('./config/partnerAuth');

const { encrypt, decrypt } = require('./util/encryption');

const ENDPOINT = `https://tuner.pandora.com/services/json/`;

module.exports = class Groovy {
	constructor(username, password) {
		if (!username && !password)
			throw new Error('Did not provide credentials');
		this.username = username;
		this.password = password;
		this.user;
		this.partner;
	}

	async login() {
		this.partner = await this._partnerLogin();
		this.user = await this._userLogin();
	}

	async request(method, dataOut = {}) {
		if (!this.partner && !this.user)
			throw new Error(
				`Please authenicate with login() before making requests`
			);

		dataOut = this._buildRequestBody(dataOut);

		const { data } = await axios({
			url: ENDPOINT,
			method: 'POST',
			params: {
				method,
				auth_token: this.user.userAuthToken,
				partner_id: this.partner.partnerId,
				user_id: this.user.userId
			},
			data: this._encryptBody(dataOut),
			headers: { 'Content-Type': 'text/plain' }
		});
		this._checkRequestStatus(data, method);
		return data;
	}

	async _partnerLogin() {
		let { data } = await axios.post(
			ENDPOINT,
			{ ...partnerAuth },
			{ params: { method: 'auth.partnerLogin' } }
		);

		data = this._checkRequestStatus(data, 'partnerLogin');

		data.syncTimeOffset =
			this._decryptSyncTime(data.syncTime) - this._seconds;

		return data;
	}

	async _userLogin() {
		const { data } = await axios({
			method: 'POST',
			url: ENDPOINT,
			params: {
				method: 'auth.userLogin',
				auth_token: this.partner.partnerAuthToken,
				partner_id: this.partner.partnerId
			},
			data: this._encryptBody({
				loginType: 'user',
				username: this.username,
				password: this.password,
				partnerAuthToken: this.partner.partnerAuthToken,
				syncTime: this.partner.syncTimeOffset + this._seconds
			}),
			headers: { 'Content-Type': 'text/plain' }
		});
		return this._checkRequestStatus(data, 'userLogin');
	}

	_checkRequestStatus(json, method) {
		if (json.stat != 'ok')
			throw new Error(
				`Unable to perform request on method ${method}, please try again`
			);
		else return json.result;
	}

	_buildRequestBody(body) {
		const auth = {
			userAuthToken: this.user.userAuthToken,
			syncTime: this.partner.syncTimeOffset + this._seconds
		};
		return { ...body, ...auth };
	}

	_encryptBody(body) {
		return encrypt(JSON.stringify(body))
			.toString('hex')
			.toLowerCase();
	}

	_decryptSyncTime(ciphered) {
		return parseInt(decrypt(ciphered).toString('utf8', 4, 14), 10);
	}

	get _seconds() {
		return (Date.now() / 1000) | 0;
	}
};
