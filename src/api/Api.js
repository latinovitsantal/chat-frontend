import { REQ, OPT, createActions } from './ApiUtils'
import axios from 'axios'
import qs from 'querystring'
import { emptyContactsStore } from '../component/home/Contacts';
import { emptyGroupsStore } from '../component/home/Groups';
import { emptyMessagesStore } from '../component/home/Messages';

export const Api = {

	public: {
		nameUsage: {
			GET: {
				params: { name: REQ }
			}
		},
		register: {
			POST: {
				json: { name: REQ, password: REQ }
			}
		},
		groups: {
			GET: { params: { limit: REQ, searchTerm: OPT } }
		},
		messages: {
			GET: { params: { limit: REQ, groupId: REQ, before: OPT } },
			new: {
				GET: { params: { groupId: REQ, lastSeenId: REQ } }
			}
		}
	},

	users: {
		me: {
			GET: {}
		},
		PUT: {
			json: { password: REQ }
		},
		GET: {
			params: { searchTerm: REQ, limit: REQ }
		},
		DELETE: {}
	},

	contacts: {
		requests: {
			PUT: { params: { receiver: REQ } },
			DELETE: { params: { sender: REQ } },
			acceptances: {
				POST: { params: { sender: REQ } }
			},
			rejections: {
				POST: { params: { sender: REQ } }
			},
			GET: {}
		},
		GET: {},
		DELETE: { partner: REQ }
	},

	messages: {
		POST: { json: { id: REQ, text: REQ } },
		GET: {
			params: { id: REQ, limit: REQ, before: OPT }
		},
		see: {
			POST: {
				params: { name: REQ, convoId: REQ, lastSeenId: REQ }
			}
		}
	},

	groups: {
		POST: { params: { groupName: REQ, type: REQ } },
		entries: {
			PUT: { params: { groupId: REQ } }
		},
		members: {
			GET: { params: { groupId: REQ } },
			DELETE: { params: { groupId: REQ, username: REQ } }
		},
		nonmembers: {
			GET: { params: { searchTerm: REQ, groupId: REQ, limit: REQ } }
		},
		invitations: {
			GET: {},
			PUT: { params: { groupId: REQ, receiver: REQ } },
			acceptances: {
				POST: { params: { groupId: REQ } }
			},
			rejections: {
				POST: { params: { groupId: REQ } }
			},
			invited: {
				GET: { params: { groupId: REQ } }
			}
		},
		GET: {},
		nameUsage: {
			GET: { params: { name: REQ } }
		},
		explore: {
			GET: { params: { searchTerm: REQ, limit: REQ } }
		}
	}

} 

export const actions = createActions(Api, "")

function token(data) {
	return axios.post('/oauth/token', qs.stringify(data), {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		auth: {
			username: 'latantal-chat',
			password: 'super-secret'
		},
	}).then( response => {
		localStorage.setItem('accessToken', response.data.access_token)
		localStorage.setItem('refreshToken', response.data.refresh_token)
		const expiresIn = response.data.expires_in
		setTimeout(refreshToken, (expiresIn - 60) * 1000)
		localStorage.setItem('tokenExpiryMillis', (new Date()) + expiresIn * 1000)
	})
}

export const login = (username, password) => {
	return token({grant_type: 'password', username, password})
}
export const refreshToken = () => token({grant_type: 'refresh_token', refresh_token: localStorage.getItem('refreshToken')})

export function logout() {
	localStorage.clear()
	emptyContactsStore()
	emptyGroupsStore()
	emptyMessagesStore()
}
