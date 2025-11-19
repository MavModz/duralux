// Alert utility functions
import Swal from 'sweetalert2'

export const errorAlert = (message) => {
  if (typeof window === 'undefined') return
  
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'btn btn-danger'
    }
  })
}

export const successAlert = (message) => {
  if (typeof window === 'undefined') return
  
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'btn btn-success'
    }
  })
}

export const showNotification = (message, type = 'success') => {
  if (typeof window === 'undefined') return
  
  Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    backdrop: false,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  }).fire({
    icon: type,
    title: message
  })
}

