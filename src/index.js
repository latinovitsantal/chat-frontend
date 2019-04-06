import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { logout } from './api/Api';

logout()
ReactDOM.render( <App/> , document.getElementById('root'))

if (module.hot) {
  module.hot.accept()
}


