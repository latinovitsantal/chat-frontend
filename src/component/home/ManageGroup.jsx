import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Api } from '../../api/Api';

const MEMBERS = 'members'
const NON_MEMBERS = 'non members'
const NON_MEMBERS_SEARCH_LIMIT = 30

export const ManageGroup = withRouter((props) => {
  const group = props.group
  const groupId = group.id
  const [contentList, setContentList] = useState({content: [], type: MEMBERS})
  const [invited, setInvited] = useState([])
  let searchText = ''
  let unmounted = false

  function fetchMembers() {
    Api.groups.members.GET({params: {groupId:group.id}}).then( response => {
      if (!response.data || unmounted) return
      setContentList({content: response.data, type: MEMBERS})
    })
  }

  function fetchInvitedUsers() {
    return Api.groups.invitations.invited.GET({params:{groupId}}).then( response => {
      if (!response.data || unmounted) return
      setInvited(response.data)
    })
  }

  function searchNonMembers(searchTerm) {
    Api.groups.nonmembers.GET(
      {params: {groupId, searchTerm, limit: NON_MEMBERS_SEARCH_LIMIT}}
    ).then( response => {
      if (!response.data || unmounted) return
      setContentList({content: response.data, type: NON_MEMBERS})
    })
  }

  function onSearchInputChange(e) {
    searchText = e.target.value
    if (searchText.length > 0) searchNonMembers(searchText)
    else fetchInvitedUsers().then(_ => fetchMembers())
  }

  const inviteUser = (receiver) => () => {
    Api.groups.invitations.PUT({params: {groupId, receiver}}).then( _ => {
      if (!unmounted) fetchInvitedUsers()
    })
  }

  const deleteMember = member => () => {
    Api.groups.members.DELETE({params: {
      groupId, username: member.name
    }}).then(_ => {
      if (!unmounted) fetchMembers()
    })
  }

  const InvitedView = (user) =>
    <div className='alert bg-secondary text-white my-1 p-2' key={user}>
      <strong>{user}</strong>
      {' (invited to the group)'}
    </div>

  const MemberView = (member) =>
    <div className='alert bg-dark text-white my-1 p-2 d-flex justify-content-between' key={member.name}>
      <div>
        <strong>{member.name}</strong>
        {' (member of the group)'}
      </div>
      {!member.admin &&
        <button className='btn btn-danger' onClick={deleteMember(member)}>Delete from group</button>
      }
      {member.admin && <strong className='text-warning'>Admin</strong>}
    </div>

  const NonMemberNonInvitedView = (user) =>
    <div className='alert bg-secondary text-white my-1 p-2 d-flex justify-content-between'
          key={user}>
      {user}
      <button className='btn btn-success' onClick={inviteUser(user)}>Invite</button>
    </div>

  function MembersView() {
    return (
      <div>
        {contentList.content.map(MemberView)}
        {invited.map(InvitedView)}
      </div>
    )
  }

  function NonMembersView() {
    return (
      <div>
        {contentList.content.map(user => invited.includes(user) ? InvitedView(user) : NonMemberNonInvitedView(user))}
      </div>
    )
  }

  function ListView() {
    console.log("render")
    if (contentList.type === MEMBERS) return MembersView()
    else return NonMembersView()
  }

  useEffect(() => {
    fetchInvitedUsers()
    fetchMembers()
    return () => unmounted = true
  }, [])

  return (
    <div className='holder'>
      <h5 className='text-light text-center'>{'Management of group: '+group.name}</h5>
      <div className="holder rounded bg-white p-1">
        <input className='form-control border-secondary border' placeholder='search for non-members'
          onChange={onSearchInputChange}/>
        <div className='content'>
          {ListView()}
        </div>
      </div>
    </div>
  )

})