import React from 'react'
import { logout } from '../../api/Api';

export function User(props) {

  return (
    <div>
      <div className='bg-light rounded'>

      </div>
      <div className='d-flex'>
        <button className='btn btn-warning flex-fill mt-1' onClick={()=> {logout(); props.setContent('public')}}>Logout</button>
      </div>
    </div>
  )
}