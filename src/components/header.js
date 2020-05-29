import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import Nav from './nav';
import logo from '../images/logo.svg';

const Header = ({ siteTitle }) => (
  <header>
    <div className='header' id='header'>
      <Link to='/'>
        <img className='logo' src={logo} alt={siteTitle} />
      </Link>
      <Nav />
    </div>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
