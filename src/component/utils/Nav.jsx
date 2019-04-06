import React from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'

export const Nav = (props) => 
  <div className='d-flex bg-dark'>
    {props.children}
  </div>

function CommonNavButton(props, marginPolicy) {
  let restClass = (props.location.pathname === props.to ? '' : 'outline-')
                + (props.colorType ? props.colorType : 'light' )
  return (
    <Link className={'flex-fill d-flex ' + marginPolicy} to={props.to} style={{textDecoration:'none'}}>
      <button className={'flex-fill btn pb-0 btn-' + restClass}>
        <h6>{props.text}</h6>
      </button>
    </Link>
  )
}

export const NavButtonLink = withRouter(props => CommonNavButton(props, 'mb-1 mr-0 ml-1'))
export const FirstNavButtonLink = withRouter(props => CommonNavButton(props, 'mb-1 mx-0'))




