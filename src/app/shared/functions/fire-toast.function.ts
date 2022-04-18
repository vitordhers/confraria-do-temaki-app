import Swal, { SweetAlertIcon } from 'sweetalert2';

const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (t) => {
    t.addEventListener('mouseenter', Swal.stopTimer);
    t.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const fireToast = (
  title?: string,
  html?: string,
  icon?: SweetAlertIcon
) => {
  toast.fire(title, html, icon);
};
