import React, { useState, useEffect } from 'react'
import { Api } from '../../api/Api';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'
import { NavButtonLink, Nav, FirstNavButtonLink } from '../utils/Nav';
import { Groups } from './Groups';
import { User } from './User';
import { Contacts } from './Contacts';
import { Messages } from './Messages';
import { ManageGroup } from './ManageGroup';
import { PublicMessages } from '../public/PublicMessages';

export let NAME = 'me'

export default function Home(props) {
  const [name, setName] = useState("...")
  Api.users.me.GET().then( response => { NAME = response.data; setName(response.data) })
  let convo
  let group
  function openConvo(history, conv) {
    convo = conv
    history.push('/messages')
  }
  function manageGroup(history, grp) {
    group = grp
    history.push('/groupmanagement')
  }
  function readPublicMessages(history, grp) {
    group = grp
    history.push('/publicmessages')
  }
  return (
    <Router>
      <div className='frame p-1'>
        <div>
          <Nav>
            <FirstNavButtonLink to='/contacts' text="Contacts" />
            <NavButtonLink to='/groups' text="Groups" />
            <NavButtonLink to='/user' text={name} colorType='success' />
          </Nav>
        </div>
        <Switch>
          <Route path='/user' render={() => <User setContent={props.setContent}/>} />
          <Route path='/contacts' render={() => <Contacts setContent={props.setContent} openConvo={openConvo}/>} />
          <Route path='/groups' render={() => 
            <Groups setContent={props.setContent}
                    openConvo={openConvo}
                    manageGroup={manageGroup}
                    readPublicMessages={readPublicMessages}/>} />
          <Route path='/messages' render={() => <Messages convo={convo}/>} />
          <Route path='/groupmanagement' render={() => <ManageGroup group={group}/>} />
          <Route path='/publicmessages' render={() => <PublicMessages group={group}/>} />
          <Redirect to='/contacts'/>
        </Switch>
      </div>
    </Router>
  )
}