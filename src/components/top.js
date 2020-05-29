import React from 'react';

const scrollDown = () => {
  const headerHeight = document.getElementById('header').offsetHeight;
  const topPanelHeight = document.getElementById('top').offsetHeight;
  const offset = topPanelHeight - headerHeight + 5;

  window.scrollTo({top: offset, left: 0, behavior: 'smooth' });
}

const Top = (props) => {
  const hasIntro = props.introText !== 'false';

  return hasIntro && (
    <div className='top' id='top'>
      <h1 className='top__title'>Hi, I'm Tommy</h1>
      <button className='top__goto-content' onClick={scrollDown}>Goto content</button>
    </div>
  );
};

export default Top;
