import React, {useState, useEffect} from 'react'
import { Api } from '../../api/Api';
import { withRouter } from 'react-router-dom'


export let groupsStore = []
export const emptyGroupsStore = () => groupsStore = []

const PRIVATE = 'PRIVATE'
const PUBLIC = 'PUBLIC'
const PUBLIC_SEARCH_LIMIT = 20

export const Groups = withRouter((props) => {

  const [groups, setGroups] = useState(groupsStore)
  const [invitations, setInvitations] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [creatingGroupType, setCreatingGroupType] = useState(PRIVATE)
  const [isCreatingGroupNameUsed, setIsCreatingGroupNameUsed] = useState(false)
  const [creatingGroupName, setCreatingGroupName] = useState('')
  const [publicGroups, setPublicGroups] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  let searchTerm = ''
  let unmounted = false

  function fetchGroups() {
    return Api.groups.GET().then( response => {
      if (!response.data) return;
      if(!unmounted) setGroups(response.data)
      groupsStore = response.data
    })
  }

  function fetchInvitations() {
    Api.groups.invitations.GET().then( response => {
      if (!unmounted) setInvitations(response.data)
    })
  }

  function fetchCreatingGroupNameUsed() {
    Api.groups.nameUsage.GET({params:{name:creatingGroupName}}).then( response => {
      if (!unmounted) setIsCreatingGroupNameUsed(response.data)
    })
  }

  function fetchPublicGroups() {
    return Api.groups.explore.GET({params: {searchTerm, limit: PUBLIC_SEARCH_LIMIT}}).then( response => {
      setPublicGroups(response.data)
    })
  }

  useEffect(() => {
    fetchGroups()
    fetchInvitations()
    return () => unmounted = true
  }, [])

  const manage = (group) => (e) => props.manageGroup(props.history, group)
  
  const acceptInvitation = (invitation) => () => {
    const groupId = invitation.groupId
    Api.groups.invitations.acceptances.POST({params:{groupId}}).then(_ => {
      fetchInvitations()
      fetchGroups()
    })
  }
  const rejectInvitation = (invitation) => () => {
    const groupId = invitation.groupId
    Api.groups.invitations.acceptances.POST({params:{groupId}}).then(_ => {
      fetchInvitations()
    })
  }

  const createGroup = () => {
    Api.groups.POST({params: {
      groupName: creatingGroupName, type: creatingGroupType
    }}).then(_ => {
      alert('Group created!')
      fetchGroups()
    }).catch(_ => {
      alert('Group with this name cannot be created!')
    })
  }

  const readPublicGroup = (group) => () => {
    props.readPublicMessages(props.history, group)
  }

  const enterPublicGroup = (group) => () => {
    Api.groups.entries.PUT({params: {groupId: group.id}}).then(_ => fetchPublicGroups())
  }

  function onCreatingGroupNameChange(event) {
    setCreatingGroupName(event.target.value)
    if (creatingGroupType === PUBLIC) fetchCreatingGroupNameUsed()
  }

  function onCreatingGroupNameKeyDown(event) {
    if (event.key == 'Enter') createGroup()
  }

  function onSearchChange(event) {
    searchTerm = event.target.value
    if (searchTerm.length == 0) fetchGroups().then(_ => setIsSearching(false))
    else fetchPublicGroups().then(_ => {if (!isSearching) setIsSearching(true)})
  }

  function GroupView(group) {
    return (
      <div className='alert bg-dark text-white my-1 p-2 d-flex' key={group.id}>
        <div onClick={() => props.openConvo(props.history, group)} style={{cursor: 'pointer'}}
              className='flex-grow-1'>
          { group.unseenCount > 0 && <span className='badge badge-success mr-2'>{group.unseenCount}</span>}
          <strong>{group.name}</strong>
        </div>
        { group.administrated && <button className='btn btn-success' onClick={manage(group)}>Manage</button> }
      </div>
    )
  }

  function InvitationView(invitation) {
    return (
      <div className='alert alert-warning my-1 p-2 d-flex justify-content-between'>
        <div>
          <strong>{'Invitation to group: '+invitation.groupName}</strong>
          {` (sent by ${invitation.sender})`}
        </div>
        <div>
          <button className='btn btn-success mr-1' onClick={acceptInvitation(invitation)}>Accept</button>
          <button className='btn btn-danger' onClick={rejectInvitation(invitation)}>Decline</button>
        </div>
      </div>
    )
  }

  function CreateGroupView() {
    if (isCreating) return (
      <div className='rounded bg-white'>
        <h3 className='text-center mt-2'>Create New Group</h3>
        <form className='align-self-center container'>
          <div className='form-group'>
            <label className='my-0 mt-2'>Group Name:</label>
            <input className={'form-control m-0 '+(isCreatingGroupNameUsed ? 'border-danger' : '')}
                placeholder='group name' onChange={onCreatingGroupNameChange} onKeyDown={onCreatingGroupNameKeyDown}/>
          </div>
          <div className='custom-control custom-radio'>
            <input type='radio' className='custom-control-input' id='privateRadio' name='groupType'
                checked={creatingGroupType === PRIVATE} readOnly/>
            <label className='custom-control-label'
                  onClick={()=>{setCreatingGroupType(PRIVATE); setIsCreatingGroupNameUsed(false)}}>
              private
            </label>
          </div>
          <div className='custom-control custom-radio'>
            <input type='radio' className='custom-control-input' id='publicRadio' name='groupType'
                checked={creatingGroupType === PUBLIC} readOnly/>
            <label className='custom-control-label'
                  onClick={()=>{setCreatingGroupType(PUBLIC); fetchCreatingGroupNameUsed()}}>
              public
            </label>
          </div>
          <div className='form-group d-flex flex-column'>
            <button className='btn btn-success mt-2' onClick={createGroup} disabled={isCreatingGroupNameUsed}>
                Create
            </button>
            <button className='btn btn-danger mt-1 mb-2' onClick={()=>setIsCreating(false)}>Cancel</button>
          </div>
        </form>
      </div>
    )
    else return (
      <button className='btn btn-success' onClick={()=>setIsCreating(true)}>Create Group</button>
    )
  }

  function PublicGroupView(group) {
    return (
      <div className='alert bg-secondary my-1 p-2 d-flex justify-content-between text-white' key={group.id}>
        <strong>{group.name}</strong>
        <div>
          <button className='btn btn-primary mr-1' onClick={readPublicGroup(group)}>Read</button>
          <button className='btn btn-success' onClick={enterPublicGroup(group)}>Enter</button>
        </div>
      </div>
    )
  }

  return (
    <div className='holder'>
      <div className='holder rounded bg-white p-1 mb-1'>
        <input className='form-control border-secondary border' placeholder='search for groups'
            onChange={onSearchChange}/>
        {isSearching ?
          <div className='content'>
            {publicGroups.map(PublicGroupView)}
          </div>
          :
          <div className='content'>
            {invitations.map(InvitationView)}
            {groups.map(GroupView)}
          </div>
        }
      </div>
      {CreateGroupView()}
    </div>
  )

})