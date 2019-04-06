import axios from 'axios'


axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.interceptors.request.use( request => {
  const accessToken = localStorage.getItem("accessToken")
  if (accessToken)
    request.headers['Authorization'] = "Bearer " + accessToken;
  console.log('Starting Request', request)
  return request
});
axios.interceptors.response.use(
	response => {
		console.log('Response: ', response)
		return response
	},
	error => {
		throw error
	}
);


const verbs = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT']
const isVerb = (key) => verbs.includes(key.toUpperCase())
export const OPT = 'optional'
export const REQ = 'required'

function cloneObject(obj) {
	const clone = {}
	for (const i in obj) {
    const type = typeof obj[i]
		if (obj[i] !== undefined && type === 'object')
			clone[i] = cloneObject(obj[i])
		else
			clone[i] = obj[i]
	}
	return clone
}

function requiredPropsOf(obj) {
	const result = []
	for (const i in obj) {
		if (obj[i] === REQ)
			result.push(i)
	}
	return result
}

function checkStructure(obj, expected) {
	const exp = cloneObject(expected)
	for (const i in obj) {
		if (!(i in exp))
			return 'unused: ' + i
    const needsObject = typeof exp[i] == 'object'
		if (obj[i].constructor === Array) {
			if (needsObject)
				return 'array instead of object: ' + i
			else continue
		}
		if (typeof obj[i] == 'object') {
			if (!needsObject)
				return 'object instead of literal: ' + i
			const checkDeeper = checkStructure(obj[i], exp[i])
			if (checkDeeper !== 'ok')
				return checkDeeper
    } else if (needsObject) {
      console.log(obj[i], typeof i, needsObject, exp[i])
      return 'literal instead of object: ' + i
    }
		delete exp[i]
	}
	const expProps = requiredPropsOf(exp)
	if (expProps.length > 0)
    return 'required: ' + expProps.join(',')
	return 'ok'
}

export function createActions(obj, url) {
  let actions = []
	for (const key in obj) {
		if (isVerb(key)) {
      const expected = obj[key]
			obj[key] = function(param) {
        const check = checkStructure(param, expected)
        if (check !== 'ok')
					throw {
						error: key + ' ' + url + ': ' + check + '. \nExpected: ' + JSON.stringify(expected)
											+ '\nGot: ' + JSON.stringify(param)
					}
				console.log(key + ' ' + url + ':  ' + JSON.stringify(param))
				const config = { method: key.toLowerCase(), url }
				if (param) {
					if (param.params) config.params = param.params
					if (param.json) config.data = param.json
				}
        return axios(config)
      }
      actions.push(key + ' ' + url + ' ' + JSON.stringify(expected))
		} else {
			actions = actions.concat(createActions(obj[key], url + '/' + key))
		}
  }
  return actions
}
