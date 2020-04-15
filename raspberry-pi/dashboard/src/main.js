function updateTemperature(temp) {
    document.getElementById("thermometer").textContent = temp.substr(0, 4);
    document.getElementById("thermometer").classList.remove("loading");
}

function setupSocket() {
    const client = new Paho.Client(location.hostname, Number(9001), "clientId");

    function connect(tries) {
        if (!tries) tries = 1;
        if (tries >= 3) {
            console.log(`Stopping: Too many tries ${tries}`);
            return;
        };
        console.log(`Connecting... try ${tries}`);
        client.connect({
            onSuccess: () => {
                console.log("Connected.");
                client.subscribe("home/temperature/1");
            },
            onFailure: () => {
                connect(tries + 1);
            }
        });
    }

    client.onConnectionLost = (responseObject) => {
        console.log("Disconnected.");
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
        setTimeout(connect, 2000);
    };

    client.onMessageArrived = (message) => {
        updateTemperature(message.payloadString);
    };

    connect();

}


document.addEventListener("DOMContentLoaded", () => {
    setupSocket();
});