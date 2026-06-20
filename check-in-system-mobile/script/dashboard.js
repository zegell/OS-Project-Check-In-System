document.addEventListener("DOMContentLoaded", function() {
    const activeUser = localStorage.getItem('username');
    
    if (activeUser) {
        document.getElementById('userGreet').innerText = "Hello, " + activeUser + "!";
    }

    renderHistory();
});

const gpsLoadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
const gpsLoadingModalHeader = document.getElementById('loadingModalHeader');
const gpsLoadingModalTitle = document.getElementById('loadingModalTitle');
const gpsLoadingModalBody = document.getElementById('loadingModalBody');

function gpsModalState(status, message) {
    if (status === 'error') {
        gpsLoadingModalHeader.className = "modal-header bg-danger text-white";
        gpsLoadingModalTitle.innerHTML = "Check-In Error";
    } else if (status === 'loading') {
        gpsLoadingModalHeader.className = "modal-header themeBlue text-white";
        gpsLoadingModalTitle.innerHTML = "Locating...";
    } else if (status === 'success') {
        gpsLoadingModalHeader.className = "modal-header bg-success text-white";
        gpsLoadingModalTitle.innerHTML = "Success";
    }
    gpsLoadingModalBody.innerHTML = `<p>${message}</p>`;
}

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
                <td>${formatGPS(row.latitude, 'lat')}</td>
                <td>${formatGPS(row.longitude, 'lng')}</td>
                <td>${row.check_in_time}</td>
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
        <iframe id = "mapFrame" src = "" allowfullscreen = "" loading = "lazy" style = "width: 350px; height: 350px;">
        </iframe>
    `;

    const mapFrame = document.getElementById('mapFrame');
    const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

    mapFrame.src = embedUrl;
    
}

function checkin() {

    gpsModalState('loading', 'Acquiring GPS coordinates...');
    gpsLoadingModal.show();

    if (!navigator.geolocation) {
        showErrorGPSModal("Unsupported Hardware");
        return;
    }

    const gpsOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;

            sendToDB(lat, long);
        },
        function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    gpsModalState('error', 'Please allow location permission');
                    setTimeout(()=> gpsLoadingModal.hide(), 2500);
                    break;
                case error.POSITION_UNAVAILABLE:
                    gpsModalState('error', 'Location signal unavailable');
                    setTimeout(()=> gpsLoadingModal.hide(), 2500);
                    break;
                case error.TIMEOUT:
                    gpsModalState('error', 'Location request timed out');
                    setTimeout(()=> gpsLoadingModal.hide(), 2500);
                    break;
            }
        },
        gpsOptions,
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
        gpsModalState('success', 'Check-In Success');
        setTimeout(()=> gpsLoadingModal.hide(), 2500);
        renderHistory();
    })
    .catch(err => {
        gpsModalState('error', err.message);
        setTimeout(()=> gpsLoadingModal.hide(), 2500);
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