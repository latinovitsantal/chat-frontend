import React, { useState } from 'react'
import {Api } from '../../api/Api';


export function Register(props) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(undefined)
  const [isUsed, setIsUsed] = useState(false)
  const onNameChange = event => { setName(event.target.value) }
  const onKeyPress = event => { if (event.key === 'Enter') submit() }
  const checkName = () => {
    Api.public.nameUsage.GET({ params: {name} })
    .then( response => {
      setIsUsed(response.data)
      if (response.data) setError('username is used!')
      else setError(undefined)
    })
  }
  const onPasswordChange = event => setPassword(event.target.value)
  function submit() {
    Api.public.register.POST({json:{name, password}})
    .then( _ => alert('siker!') )
    .catch( error => setError('Unsuccessful registration!'))
  }
  return (
    <div className='content d-flex flex-column justify-content-center bg-white rounded row m-0'>
      <div className='align-self-center container'>
        <div className='form-group'>
          <label className='text-center'>Username:</label>
          <input className={`form-control ${isUsed ? ' text-danger' : ''}`}  placeholder='username'
                  onChange={onNameChange} onKeyUp={checkName} onKeyDown={onKeyPress}/>
        </div>
        <div className='form-group'>
          <label>Password:</label>
          <input type='password' className='form-control' placeholder='password'
                  onChange={onPasswordChange} onKeyDown={onKeyPress}/>
        </div>
        <div className='form-group d-flex flex-column'>
          <button className='btn btn-primary' onClick={submit}>Register</button>
        </div>
        { error && <div className='alert alert-danger alert-dismissible'>{error}</div> }
      </div>
    </div>
  )
}