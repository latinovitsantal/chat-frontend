import React, {useState, useEffect} from 'react'
import { withRouter } from 'react-router-dom'
import { Api, logout } from '../../api/Api';
import { NAME } from './Home';

export let contactsStore = []
export const emptyContactsStore = () => contactsStore = []

const FRIENDS = 'friends'
const STRANGERS = 'strangers'
const SEARCH_LIMIT = 30

export const Contacts = withRouter((props) => {

  const [contentList, setContentList] = useState({content: contactsStore, type: FRIENDS})
  const [requests, setRequests] = useState([])
  let unmounted = false
  let searchText = ""

  function onSearchInputChange(e) {
    searchText = e.target.value
    if (searchText.length > 0) searchStrangers(searchText)
    else fetchContacts()
  }

  function fetchContacts() {
    Api.contacts.GET().then( response => {
      if (!response.data) return
      if (!unmounted)
        setContentList({content: response.data, type: FRIENDS})
      contactsStore = response.data
    })
  }

  function fetchRequests() {
    Api.contacts.requests.GET().then( response => {
      if (!response.data) return
      if (!unmounted) setRequests(response.data)
    })
  }

  function searchStrangers(searchTerm) {
    Api.users.GET({ params: {searchTerm, limit: SEARCH_LIMIT}}).then( response => {
      if (!response.data) return
      if (!unmounted) setContentList(
        {content: response.data.filter(r => r.name != NAME), type: STRANGERS}
        )
    })
  }

  useEffect(() => {
    fetchContacts()
    fetchRequests()
    return () => unmounted = true
  }, [])

  const sendRequest = (username) => () => {
    Api.contacts.requests.PUT({params:{receiver: username}}).then(_ => {
      searchStrangers(searchText)
    })
  }

  const acceptRequest = (username) => () => {
    Api.contacts.requests.acceptances.POST({params:{sender:username}}).then(_ => {
      alert('Request accepted')
      fetchContacts()
      fetchRequests()
    })
  }

  const declineRequest = (username) => () => {
    Api.contacts.requests.rejections.POST({params:{sender:username}}).then(_ => {
      alert('Request declined')
      fetchContacts()
      fetchRequests()
    })
  }

  const strangersListView = () => {
    return contentList.content.filter( it => it !== NAME).map( stranger => 
      <div className='alert bg-secondary text-white my-1 p-2 d-flex justify-content-between'
            key={stranger} id={'stranger-'+stranger}>
        <strong>{stranger}</strong>
        <button className='btn btn-success' onClick={sendRequest(stranger)}>
          <small>Send Request</small>
        </button>
      </div>
    )
  }

  const friendsListView = () => {
    const friends = contentList.content.map( contact =>
      <div className='alert bg-dark text-white my-1 p-2' key={contact.id} style={{cursor:'pointer'}}
            onClick={() => props.openConvo(props.history, contact)}>
        { contact.unseenCount > 0 && <span className='badge badge-success mr-2'>{contact.unseenCount}</span>}
        <strong>{contact.username}</strong>
      </div>
    )
    const reqs = requests.map( request => 
      <div className='alert alert-warning my-1 p-2 d-flex justify-content-between'
            key={request.username} id={'request-'+request.username}>
        <div>
          {'Request send by '}
          <strong>{request.username}</strong>
          {' (' + new Date(request.time).toLocaleDateString() + ')'}
        </div>
        <div>
          <button className='btn btn-success mr-1' onClick={acceptRequest(request.username)}>Accept</button>
          <button className='btn btn-danger' onClick={declineRequest(request.username)}>Decline</button>
        </div>
      </div>  
    )
    return reqs.concat(friends)
  }

  const ListView = () => {
    if (contentList.type === FRIENDS) return friendsListView()
    else return strangersListView()
  }

  return (
    <div className='holder rounded bg-white p-1'>
      <input className='form-control border-secondary' placeholder='search for contacts'
            onChange={onSearchInputChange}/>
      <div className='content'>
          { ListView() }
      </div>
    </div>
  )
})