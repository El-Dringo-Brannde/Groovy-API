const crypto = require('crypto');
const iv = new Buffer.from('');
const { decryptPassword, encryptPassword } = require('../config/passwords');

const PADDING_LENGTH = 16;
const PADDING = Array(PADDING_LENGTH).join('\0');

const createCryptor = key => {
	key = new Buffer.from(key);
	return data => {
		var cipher = crypto.createCipheriv('bf-ecb', key, iv);
		cipher.setAutoPadding(false);
		var padLength = PADDING_LENGTH - (data.length % PADDING_LENGTH);
		if (padLength === PADDING_LENGTH) {
			padLength = 0;
		}
		try {
			return Buffer.concat([
				cipher.update(data + PADDING.substr(0, padLength)),
				cipher.final()
			]);
		} catch (e) {
			return null;
		}
	};
};

const createDecryptor = key => {
	key = new Buffer.from(key);
	return function(data) {
		var cipher = crypto.createDecipheriv('bf-ecb', key, iv);
		cipher.setAutoPadding(false);
		try {
			return Buffer.concat([cipher.update(data), cipher.final()]);
		} catch (e) {
			return null;
		}
	};
};

exports.decrypt = cipher => {
	var blowfish = createDecryptor(decryptPassword);
	var buff = blowfish(new Buffer.from(cipher, 'hex'));
	return buff;
};

exports.encrypt = plain => {
	var blowfish = createCryptor(encryptPassword);
	var buff = blowfish(plain);
	return buff;
};
