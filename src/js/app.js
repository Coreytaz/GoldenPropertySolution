// Формы не имеют подключённого серверного обработчика. Не создаём видимость отправки заявки.
document.querySelectorAll('[data-lead-form]').forEach((form) => {
  form.addEventListener('input', () => {
    const status = form.querySelector('.form-status')
    if (status) status.textContent = ''
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const status = form.querySelector('.form-status')
    if (status) {
      status.textContent = 'Заявка не отправлена: сервис приёма заявок пока не подключён.'
    }
  })
})
