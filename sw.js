self.addEventListener("push", event => {
    console.log("Push event received: ", event.data ? event.data.text() : "No payload");
    // const data = event.data.text()
    const text = event.data ? event.data.text(): "No payload";
    // self.registration.showNotification(data.title, {
    //     body: data.body
    self.registration.showNotification("New Message", {body: text});
});