import React, { Component } from 'react'
import { Api } from '../../api/Api';
import { NAME } from './Home';

export let messagesStore = {}
export const emptyMessagesStore = () => messagesStore = {}
const LOAD_LIMIT = 20
const SEE_INTERVAL = 500

export class Messages extends Component {

	constructor(props) {
		super(props)
		this.isAllShown = true
		this.id = props.convo.id
		if (props.convo.username) this.title = 'partner: ' + props.convo.username
		else this.title = 'group: ' + props.convo.name
		if (!messagesStore[this.id]) messagesStore[this.id] = []
		this.state = { messages: messagesStore[this.id] }
	}

	componentDidMount() {
		this.jumpToBottom()
		this.mounted = true;
		Api.messages.GET({params:{id: this.id, limit: LOAD_LIMIT}}).then( response => {
			if (!response.data) return
			if (!this.mounted) return
			const messages = response.data.reverse()
			console.log(messages.length)
			this.isAllShown = messages.length < LOAD_LIMIT
			messagesStore[this.id] = messages
			this.setState({messages})
			this.see()
		})
	}
	
	componentWillUpdate() {
		const node = this.getMsgWindow()
		this.distanceFromBottom = node.scrollHeight - node.scrollTop
		this.shouldScrollBottom = node.offsetHeight === this.distanceFromBottom
	}

	componentDidUpdate() {
		if (this.shouldScrollBottom) this.jumpToBottom()
		else this.stayOnPosition()
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	sendMessage = () => {
		const inputField = this.getInputField()
		Api.messages.POST({json: {id: this.id, text: inputField.value}})
		document.getElementById('msgInput').value = ""
		inputField.value = ""
		this.jumpToBottom()
	}

	see = () => {
		Api.messages.see.POST({params: {
			convoId: this.id, lastSeenId: this.getLast().id}
		}).then( response => {
			if (!response.data) return
			if (!this.mounted) return
			const messages = this.state.messages.concat(response.data.reverse())
			messagesStore[this.id] = messages
			this.setState({messages})
			setTimeout(this.see, SEE_INTERVAL)
		}).catch(_=> setTimeout(this.see, SEE_INTERVAL))
	}

	loadPrevMessages = () => {
		Api.messages.GET(
			{params: {id: this.id, limit: LOAD_LIMIT, before: this.getFirst().id}}
		).then(response => {
			if (!response.data) return
			if (!this.mounted) return
			if (response.data.length < LOAD_LIMIT) this.isAllShown = true
			if (response.data.length === 0) return
			const messages = response.data.reverse().concat(this.state.messages)
			messagesStore[this.id] = messages
			this.setState({messages})
		})
	}

	getInputField = () => document.getElementById('msgInput')
	getMsgWindow = () => document.getElementById('msgwin')

	jumpToBottom = () => {
		const node = this.getMsgWindow()
		node.scrollTop = node.scrollHeight
	}
	stayOnPosition = () => {
		const node = this.getMsgWindow()
		node.scrollTop = node.scrollHeight - this.distanceFromBottom
	}

	getFirst = () => this.state.messages[0]
	getLast = () => this.state.messages[this.state.messages.length - 1]

	onKeyDown = (event) => { if (event.key === 'Enter') this.sendMessage() }

	MessageView = (message) => {
		let offset, color
		switch (message.username) {
			case NAME: [offset, color] = [2, 'success']; break;
			case null: [offset, color] = [1, 'dark']; break;
			default: [offset, color] = [0, 'primary']
		}
		return (
			<div className='row m-0 p-0' key={message.id}>
				<div className={'col-10 p-0 offset-'+offset}>
					<div className='mx-1 mt-0 mb-1'>
						<small>
							{message.username && message.username + ' | '}
							{new Date(message.time).toLocaleString()}
						</small>
						<div className={'alert m-0 p-1 border-secondary alert-'+color}>
							{message.text}
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<div className='holder'>
				<h5 className='text-light text-center'>{this.title}</h5>
				<div className='content rounded bg-light pr-2' id='msgwin'>
					{!this.isAllShown &&
						<div className='d-flex justify-content-around'>
							<button className='btn btn-secondary mt-1' onClick={this.loadPrevMessages}>
								Load previous messages</button>
						</div>
					}
					{this.state.messages.map(this.MessageView)}
				</div>
				<div className='d-flex'>
					<input id='msgInput' className='form-control border-secondary border mt-1'
									placeholder='type message' onKeyDown={this.onKeyDown}/>
					<button className='btn btn-primary ml-1 mt-1' onClick={this.sendMessage}>Send</button>
				</div>
			</div>
		)
	}

}
