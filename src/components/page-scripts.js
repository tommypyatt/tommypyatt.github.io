import throttle from 'lodash.throttle';
const email = 'tommy_AT_pyatt.me'.replace('_AT_', '@'); // Spam mask

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('scroll', throttle(() => {
    const y = window.scrollY;

    if (!!y) {
      document.body.classList.add('is-scrolled');
    } else {
      document.body.classList.remove('is-scrolled');
    }
  }, 500));

  window.addEventListener('load', () => {
    [].forEach.call(document.getElementsByClassName('mailto-email'), (el) => {
      el.href = `mailto:${email}`
    });
  })
}
