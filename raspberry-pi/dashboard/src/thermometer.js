const bgColor = "#011627";
const textColor = "#d2dee7";
const accentColor = "#219fd5";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const NOW = () => (new Date()).getTime();

const layout = {
    showlegend: false,
    plot_bgcolor: bgColor,
    paper_bgcolor: bgColor,
    margin: {
        l: 50,
        b: 40,
        t: 40,
        r: 40,
    },
    colorway: [accentColor],
    yaxis: {
        color: textColor,
        autorange: true,
    },
    xaxis: {
        color: textColor,
        type: "date",
        range: [NOW() - 2 * MINUTE, NOW() + MINUTE],
        rangeselector: {
            buttons: [
                {
                    count: 1,
                    label: '1min',
                    step: 'minute',
                    stepmode: 'backward'
                },
                {
                    count: 10,
                    label: '10min',
                    step: 'minute',
                    stepmode: 'backward'
                },
                {
                    count: 30,
                    label: '0.5h',
                    step: 'minute',
                    stepmode: 'backward'
                },
                {
                    count: 1,
                    label: '1h',
                    step: 'hour',
                    stepmode: 'backward'
                },
                {
                    count: 6,
                    label: '6h',
                    step: 'hour',
                    stepmode: 'backward'
                },
                {
                    count: 1,
                    label: '1d',
                    step: 'day',
                    stepmode: 'backward'
                },
                {
                    count: 7,
                    label: '1v',
                    step: 'day',
                    stepmode: 'backward'
                },
                {
                    count: 1,
                    label: '1m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {
                    count: 6,
                    label: '6m',
                    step: 'month',
                    stepmode: 'backward'
                },
                {
                    count: 1,
                    label: '1y',
                    step: 'year',
                    stepmode: 'backward'
                },
            ],
        },
    },
};
const config = {
    scrollZoom: true,
    displayModeBar: false,
    responsive: true,
}

function moveCurrentTime() {
    let currentRange = document.getElementById('thermometer-graph').layout.xaxis.range.map(v => (new Date(v)).getTime());
    if (NOW() <= currentRange[1] + 10 * SECOND) {
        let nowTime = NOW();
        Plotly.relayout('thermometer-graph', {
            shapes: [{
                type: 'line',
                x0: nowTime,
                x1: nowTime,
                y0: 0,
                yref: 'paper',
                y1: 100,
                line: {
                    color: 'white',
                    width: 1.5,
                    dash: 'dot'
                },
            }],
        });
    }
}

function addToGraph(temp, timestamp) {
    let currentRange = document.getElementById('thermometer-graph').layout.xaxis.range.map(v => (new Date(v)).getTime());

    const data = {
        x: [[timestamp]],
        y: [[parseFloat(temp)]],
    };
    Plotly.extendTraces("thermometer-graph", data, [0]);

    if (NOW() <= currentRange[1] + 10 * SECOND) {
        const lastTwoElements = document.getElementById('thermometer-graph').data[0].x.slice(-2);
        const diff = lastTwoElements[1] - lastTwoElements[0];
        let newLayout = layout;
        newLayout.xaxis.range = currentRange;
        newLayout.xaxis.range[1] = NOW() + 20 * SECOND;
        Plotly.relayout("thermometer-graph", newLayout);
    }
}

function updateGraph(e) {
    if (e["xaxis.range[0]"] || e["xaxis.range[1]"]) {
        let currentRange = document.getElementById('thermometer-graph').layout.xaxis.range.map(v => (new Date(v)).getTime());
        let newLayout = layout;
        newLayout.xaxis.fixedrange = true;
        Plotly.relayout("thermometer-graph", newLayout)
            .then(() => fetch(`http://${location.hostname}:8081/history/thermometer1?start=${currentRange[0] - MINUTE}&end=${currentRange[1] + 10 * SECOND}`))
            .then((res) => res.json())
            .then((temp_list) => {
                if (temp_list.length) {
                    let data = {
                        x: [temp_list.map((i) => i.timestamp)],
                        y: [temp_list.map((i) => parseFloat(i.value))],
                    }
                    newLayout.xaxis.fixedrange = false;
                    return Plotly.update("thermometer-graph", data, newLayout);
                } else {
                    newLayout.xaxis.fixedrange = false;
                    return Plotly.relayout("thermometer-graph", newLayout);
                }
            }).finally(() => {
                if (e.startSocket) setupSocket();
            });
    }
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
        addToGraph(message.payloadString, NOW());
    };

    connect();

}


document.addEventListener("DOMContentLoaded", () => {

    Plotly.newPlot("thermometer-graph", [{ x: [], y: [], }], layout, config);
    updateGraph({ "xaxis.range[0]": true, startSocket: true });

    document.getElementById('thermometer-graph').on('plotly_relayout', (e) => {
        updateGraph(e);
    });

    setInterval(() => {
        moveCurrentTime();
    }, 100);

});