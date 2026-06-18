document.addEventListener("DOMContentLoaded", function() {
    const activeUser = localStorage.getItem('username');
    
    if (activeUser) {
        document.getElementById('userGreet').innerText = "Hello, " + activeUser + "!";
    }

    renderHistory();
});

function renderHistory() {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;
    
    fetch (`https://forsynthia.shares.zrok.io/check-in-system-api/fetch-checkin.php?user_id=${user_id}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
        else {
            throw new Error("Could not load tracking history");
        }
    })
    .then(logs => {
        const tableBody = document.getElementById('checkInTableBody');
        const totalCheckIn = document.getElementById('totalCheckIn');
        tableBody.innerHTML = "";

        if (totalCheckIn) {
            totalCheckIn.innerHTML = logs.length;
        }

        if (logs.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan = "4" class = "text-center text-muted py-3">
                No data
                </td>
            </tr>
            `;
            return;
        }

        logs.forEach(row => {
            const tr = document.createElement('tr');
            tr.style.cursor = "pointer";
            tr.setAttribute('onclick', `renderMap(${row.latitude}, ${row.longitude})`);
            tr.innerHTML = `
                <th scope = "row">${row.checkin_id}</th>
                <td>${formatGPS(row.longitude, 'lng')}</td>
                <td>${formatGPS(row.latitude, 'lat')}</td>
                <td>${row.checkin_time}</td>
            `;
            tableBody.appendChild(tr);
        });
    })
    .catch(err => {
        console.error("Table compile failure", err);
        const totalCheckIn = document.getElementById('totalCheckIn');
        if (totalCheckIn) totalCheckIn.innerHTML = "0"
    });
}

function renderMap(lat, lng) {
    const renderMap = document.getElementById('mapWrapper');
    renderMap.innerHTML = `
        <iframe id = "mapFrame" src = "" allowfullscreen = "" loading = "lazy" style = "width: 450px; height: 450px;">
        </iframe>
    `;

    const mapFrame = document.getElementById('mapFrame');
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

    mapFrame.src = embedUrl;
    
}

function checkin() {
    if (!navigator.geolocation) {
        alert("Hardware not supported");
        return;
    }
    const gpsOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    alert("Locating device coordinates...");

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;

            sendToDB(lat, long);
        },
        function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("Please enable app GPS permission");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Check Device Signal Visibility");
                    break;
                case error.TIMEOUT:
                    alert("Location timed out. Try Again");
                    break;
            }
        },
        gpsOptions
    );
}

function sendToDB(latitude, longitude) {
    const user_id = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');

    fetch('https://forsynthia.shares.zrok.io/check-in-system-api/checkin.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: user_id, username: username, latitude: latitude, longitude: longitude})
    })
    .then(response => {
        if (response.status === 201 || response.status === 200) {
            return response.json();
        }
        else {
            throw new Error("Server failure. Response status: " + response.status);
        }
    })
    .then(data => {
        alert("Check-In Success");
        renderHistory();
    })
    .catch(err => {
        alert("Logging Failure: " + err.message);
        console.error("Network error logs:", err);
    });
}

function formatGPS(value, type) {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.0000°";

    const absValue = Math.abs(num).toFixed(4);

    if (type === 'lat') {
        return num >= 0 ? `${absValue}° N` : `${absValue}° S`;
    }
    else {
        return num >= 0 ? `${absValue}° E` : `${absValue}° W`;
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = "index.html";
}