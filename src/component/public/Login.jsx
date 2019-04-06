import React, { useState } from 'react'
import { login } from '../../api/Api';

export function Login(props) {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(undefined)
  const onNameChange = event => setName(event.target.value)
  const onPasswordChange = event => setPassword(event.target.value)
  const onKeyPress = event => {
    if (event.key === 'Enter') submit()
    if (error) setError(undefined)
  }
  function submit() {
    login(name, password)
    .then( _ => {props.setContent('home') })
    .catch( error => setError('Bad Credentials!'))
  }

  return (
    <div className='content d-flex flex-column justify-content-center bg-white rounded row m-0'>
      <div className='align-self-center container'>
        <div className='form-group'>
          <label>Username:</label>
          <input className='form-control' placeholder='username' onChange={onNameChange} onKeyDown={onKeyPress}/>
        </div>
        <div className='form-group'>
          <label>Password:</label>
          <input type='password' className='form-control' placeholder='password' onChange={onPasswordChange} onKeyDown={onKeyPress}/>
        </div>
        <div className='form-group d-flex flex-column'>
          <button className='btn btn-primary' onClick={submit}>Login</button>
        </div>
        { error && <div className='alert alert-danger alert-dismissible'>{error}</div> }
      </div>
    </div>
  )
}