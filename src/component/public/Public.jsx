import React from 'react'
import { NavButtonLink, Nav, FirstNavButtonLink } from '../utils/Nav';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { Login } from './Login';
import { Register } from './Register';
import { PublicGroups } from './PublicGroups';
import { PublicMessages } from './PublicMessages';

export default function Public(props) {
  const renderLogin = () => <Login setContent={props.setContent}/>
  const renderRegister = () => <Register setContent={props.setContent}/>

  let group
  function readPublicMessages(history, grp) {
    group = grp
    history.push('/publicmessages')
  }

  return (
    <Router>
      <div className='frame p-1'>
        <Nav>
          <FirstNavButtonLink to='/login' text="Login"/>
          <NavButtonLink to='/register' text="Register"/>
          <NavButtonLink to='/publicgroups' text="Public groups"/>
        </Nav>
        <Switch>
          <Route path='/login' render={renderLogin}/>
          <Route path='/register' render={renderRegister}/>
          <Route path='/publicgroups' render={()=> <PublicGroups readPublicMessages={readPublicMessages} />}/>
          <Route path='/publicmessages' render={() => <PublicMessages group={group}/>} />
          <Redirect to='/login'/>
        </Switch>
      </div>
    </Router>
  )
}

