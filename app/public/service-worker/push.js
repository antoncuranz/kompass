self.addEventListener("push", (event) => {
  console.log("received push event", event)
  if (event.data) {
    const data = event.data.json()
    const { title, ...rest } = data

    event.waitUntil(
      self.registration.showNotification(title, {
        ...rest,
      })
    )
  }
})
