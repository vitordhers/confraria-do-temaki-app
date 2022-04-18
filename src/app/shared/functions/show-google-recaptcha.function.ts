import { isPlatformBrowser } from '@angular/common';

export const showGoogleRecaptcha = (platformId) => {
  if (isPlatformBrowser(platformId)) {
    const element = document.getElementsByClassName('grecaptcha-badge');
    if (element && element[0] && document) {
      element[0].setAttribute('id', 'grecaptcha_badge');
      document.getElementById('grecaptcha_badge').style.display = 'block';
    }
  }
};
