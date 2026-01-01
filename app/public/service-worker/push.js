self.addEventListener("push", event => {
  if (event.data) {
    const data = event.data.json()
    const { title, ...rest } = data

    event.waitUntil(
      self.registration.showNotification(title, {
        ...rest,
      }),
    )
  }
})
