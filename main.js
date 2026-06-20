document.getElementById("subscribe").addEventListener("click", async() => {
    //Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js");

    //Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted"){
        alert("Notifications blocker");
        return;
    }
    console.log("Service worker registered:", registration);

    const publicKey = await getVapidPublicKey();

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
    });
    console.log("Subscription: ", subscription);

    // await fetch("http://127.0.0.1:5000/subscribe", {
    await fetch("https://push-backend-1d53.onrender.com/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(subscription)
    });

    alert("Subscribed successfully.")
    document.getElementById("subscribe").disabled = true;

});

async function sendTestNotification() {
    try {
        const response = await fetch("https://push-backend-1d53.onrender.com/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Hello from the frontend test button!"
            })
        });

        const result = await response.json();
        alert("Notification sent! Sent: " + result.sent + ", Failed: " + result.failed);
    } catch (err) {
        console.error("Error sending test notification:", err);
        alert("Failed to send test notification.");
    }
}



async function getVapidPublicKey(){
    // const res = await fetch("/vapidPublicKey");
    // const res = await fetch("http://127.0.0.1:5000/vapidPublicKey");
    const res = await fetch("https://push-backend-1d53.onrender.com/vapidPublicKey");


    const data = await res.json();
    console.log("VAPID public key: ", data.publicKey)
    return data.publicKey;
}

function urlBase64ToUint8Array(base64String){
    const padding = "=".repeat((4 - base64String.length % 4)%4)
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    

    for (let i = 0; i < rawData.length; ++i){
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function unsubscribeUser() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            alert("Service worker not found");
            return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            alert("You are not subscribed");
            return;
        }

        // Unsubscribe in the browser
        const success = await subscription.unsubscribe();
        if (!success) {
            alert("Failed to unsubscribe locally");
            return;
        }

        // Notify backend to remove subscription
        await fetch("https://push-backend-1d53.onrender.com/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        alert("Unsubscribed successfully");
        document.getElementById("subscribe").disabled = false;

    } catch (err) {
        console.error("Unsubscribe error:", err);
        alert("Error during unsubscribe");
    }
}

document.getElementById("sendTest").addEventListener("click", sendTestNotification);
document.getElementById("unsubscribe").addEventListener("click", unsubscribeUser);
