import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Api } from '../../api/Api';

const MESSAGE_FETCH_LIMIT = 10
const REFRESH_INTERVAL = 800

export class PublicMessages extends Component {

  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      hasOlder: false
    }
    this.group = props.group
    this.unmounted = false
  }

  componentDidMount() {
    this.fetchMessages().then(_ => this.see())
  }

  componentWillUpdate() {
    const win = this.getMessageWindow()
    this.distanceFromBottom = win.scrollHeight - win.scrollTop
    this.shouldScrollToBottom = win.offsetHeight == this.distanceFromBottom
  }

  componentDidUpdate() {
    if (this.shouldScrollToBottom) this.jumpToBottom()
    else this.stayOnPosition()
  }

  componentWillMount() {
    this.unmounted = false
  }

  jumpToBottom = () => {
    const win = this.getMessageWindow()
    win.scrollTop = win.scrollHeight
  }

  stayOnPosition = () => {
    const win = this.getMessageWindow()
    win.scrollTop = win.scrollHeight - this.distanceFromBottom
  }

  see = () => {
    this.fetchNewMessages().then(_ => {
      if (!this.unmounted)
        setTimeout(this.see, REFRESH_INTERVAL)
    })
  }

  fetchMessages = () => {
    return Api.public.messages.GET({params: {
      groupId: this.group.id,
      limit: MESSAGE_FETCH_LIMIT
    }}).then( response => {
      if (!this.unmounted) {
        const messages = response.data.reverse()
        const hasOlder = messages.length >= MESSAGE_FETCH_LIMIT
        this.setState({messages, hasOlder})
      }
    })
  }

  fetchNewMessages = () => {
    return Api.public.messages.new.GET({params: {
      groupId: this.group.id,
      lastSeenId: this.getLastMessage().id
    }}).then(response => {
      const newMessages = response.data
      if (newMessages.length > 0 && !this.unmounted) {
        const messages = this.state.messages.concat(newMessages)
        this.setState({messages})
      }
    })
  }

  fetchOlderMessages = () => {
    return Api.public.messages.GET({params: {
      groupId: this.group.id,
      limit: MESSAGE_FETCH_LIMIT,
      before: this.getFirstMessage().id
    }}).then(response => {
      const oldMessages = response.data.reverse()
      if (oldMessages.length > 0 && !this.unmounted) {
        this.setState({
          messages: oldMessages.concat(this.state.messages),
          hasOlder: oldMessages.length >= MESSAGE_FETCH_LIMIT
        })
      }
    })
  }

  getMessageWindow = () => document.getElementById('msgWin')
  getFirstMessage = () => this.state.messages[0]
  getLastMessage = () => this.state.messages[this.state.messages.length - 1]

  MessageView = message => {
    const name = message.username
    const datePrefix = name ? name + ' | ' : ''
    const colorType = name ? 'secondary' : 'dark'
    return (
      <div className='my-1 ml-1 mr-3' key={message.id}>
        {datePrefix + new Date(message.time).toLocaleString()}
        <div className={'alert border-secondary m-0 p-1 alert-'+colorType}>
          {message.text}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className='holder'>
        <h5 className='text-white text-center'>{'Reading public group: '+this.group.name}</h5>
        <div className='content rounded bg-white' id='msgWin'>
          {this.state.hasOlder && 
            <div className='d-flex justify-content-around'>
              <button className='btn btn-secondary my-1' onClick={this.fetchOlderMessages}>See Older Messages</button>
            </div>
          }
          {this.state.messages.map(this.MessageView)}
        </div>
      </div>
    )
  }

}
