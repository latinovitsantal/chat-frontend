import React, { useState } from 'react'
import 'simplebar/dist/simplebar.min.css';
import Public from './component/public/Public'
import Home from './component/home/Home'

function App() {
  const [content, setContent] = useState(localStorage.getItem('accessToken') ? 'home' : 'public')
  return (
    <div className='frame bg-dark'>
      {content === 'home' && <Home setContent={setContent} /> }
      {content === 'public' && <Public setContent={setContent} /> }
    </div>
  )
}

export default App;