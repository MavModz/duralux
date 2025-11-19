export const errorAlert = (message) => {
  if (process.client) {
    // Using SweetAlert2 if available, otherwise fallback to alert
    if (window.Swal) {
      window.Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      })
    } else {
      alert(message)
    }
  }
}

export const successAlert = (message) => {
  if (process.client) {
    if (window.Swal) {
      window.Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'btn btn-success'
        }
      })
    } else {
      alert(message)
    }
  }
}

export const showNotification = (message, type = 'success') => {
  if (process.client) {
    if (window.Swal) {
      window.Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        backdrop: false,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', window.Swal.stopTimer)
          toast.addEventListener('mouseleave', window.Swal.resumeTimer)
        }
      }).fire({
        icon: type,
        title: message
      })
    }
  }
}

