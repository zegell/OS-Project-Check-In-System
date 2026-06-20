function login(event) {
    event.preventDefault();

    const username = document.getElementById('logInUsername').value;
    const password = document.getElementById('logInPassword').value;
    const logInModal = new bootstrap.Modal(document.getElementById('logInModal'));
    const logInModalHeader = document.getElementById('logInModalHeader');
    const logInModalTitle = document.getElementById('logInModalTitle');
    const logInModalBody = document.getElementById('logInModalBody');

    function logInModalState(status, message) {
    if (status === 'error') {
        logInModalHeader.className = "modal-header bg-danger text-white";
        logInModalTitle.innerHTML = "Log In Error";
    } else if (status === 'success') {
        logInModalHeader.className = "modal-header bg-success text-white";
        logInModalTitle.innerHTML = "Log In Success";
    }
    logInModalBody.innerHTML = `<p>${message}</p>`;
    logInModal.show();
    setTimeout(() => logInModal.hide(), 2500);
    }

    fetch('https://forsynthia.shares.zrok.io/check-in-system-api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
        else if (response.status === 400) {
            logInModalState('error', 'Username and Password are Required');
            throw new Error('Username and Password are Required');
        }
        else if (response.status === 401) {
            logInModalState('error', 'Invalid Username or Password');
            throw new Error('Invalid username or password');
        }2
    })
    .then(user => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_id', user.user_id);
        localStorage.setItem('username', user.username);
        logInModalState('success', 'Logging In');
        
        window.location.href = "dashboard.html";
    })
    .catch(err => {
        logInModalState('error', err.message);
    });
}