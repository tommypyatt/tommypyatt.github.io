import React from 'react';

const Nav = () => (
  <ul className='nav'>
    <li className='nav__item nav__item--linkedin'>
      <a href='https://uk.linkedin.com/in/tommy-pyatt-69a78461' target='_blank' rel="noreferrer">LinkedIn</a>
    </li>
    <li className='nav__item nav__item--github'>
      <a href='https://github.com/tommypyatt' target='_blank' rel="noreferrer">GitHub</a>
    </li>
    <li className='nav__item nav__item--twitter'>
      <a href='https://twitter.com/tommy_pyatt' target='_blank' rel="noreferrer">Twitter</a>
    </li>
    <li className='nav__item nav__item--email'>
      <a href='/' className='mailto-email'>Email</a>
    </li>
  </ul>
);

export default Nav;
