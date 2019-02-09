# Groov
A wrapper around the unofficial pandora API. Please keep in mind, that the Pandora API is unofficial, meaning Pandora may change it. 

This package allows for async/await requests with the Pandora API, moving await from callback hell in earlier versions. 

The list of valid requests to the API can be found [here](https://6xq.net/pandora-apidoc/json/methods/)

## Installation 

Simply import the package into your project with import or ES6

`import Groovy from 'groo-v'` 

or in NodeJS 

`const Groovy = require('groo-v')`

## Usage 

Firstly, one would need to provide their Pandora credentials when calling the construtor, for example: 

```javascript
const Groov = require('groo-v')

const pandora = new Groov('USERNAME', 'PASSWORD')
```

Secondly, they would have to call the `login` function and `await` it appropriately. 

I.E: 

```javascript
const Groov = require('groo-v')

const pandora = new Groov('USERNAME', 'PASSWORD')

// Some async function
(async () => await pandora.login())()
```

Lastly, now that you have been authenicated, you can now call unofficial [requests](https://6xq.net/pandora-apidoc/json/methods/) from Pandora. 

For example: 

```javascript
const Groov = require('groo-v')

const pandora = new Groov('USERNAME', 'PASSWORD')

// Some async function
(async () => {
	await pandora.login()
	const result = await pandora.request('user.getStationList')
	// [
		Your data here
	]
})()
```

## Testing 
To test provide your valid pandora login via EMAIL and PASSWORD `env` variables. I.E:
`$ EMAIL=foobar@gmail.com PASSWORD=super-secret yarn test`

_TESTING WITHOUT PROVIDING CREDENTIALS WILL SURELY RESULT IN FAILED TESTS_