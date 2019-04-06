import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Api } from '../../api/Api';

const LIMIT = 20

export const PublicGroups = withRouter(props => {

  const [groups, setGroups] = useState([])
  let unmounted = false
  let searchTerm = ''


  function fetchGroups() {
    return Api.public.groups.GET({params: {limit: LIMIT, searchTerm}}).then( response => {
      if (!unmounted) setGroups(response.data)
    })
  }

  function onInputChange(event) {
    searchTerm = event.target.value
    fetchGroups()
  }

  const read = group => () => {
    props.readPublicMessages(props.history, group)
  }

  useEffect(() => {
    fetchGroups()
    return () => unmounted = true
  }, [])

  const GroupView = group =>
    <div className='alert alert-secondary border-secondary d-flex justify-content-between p-1' key={group.name}>
      <strong className='pl-2 pt-1'>{group.name}</strong>
      <button className='btn btn-primary' onClick={read(group)}>Read</button>
    </div>

  return (
    <div className='holder rounded bg-white p-1'>
      <input type="text" className='form-control border-secondary' placeholder='search for public groups'
          onChange={onInputChange}/>
      <div className='content mt-1'>
        {groups.map(GroupView)}
      </div>
    </div>
  )

})