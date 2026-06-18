function login(event) {
    event.preventDefault();

    const username = document.getElementById('logInUsername').value;
    const password = document.getElementById('logInPassword').value;

    fetch('https://forsynthia.shares.zrok.io/check-in-system-api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }
        else {
            throw new Error('Invalid username or password');
        }
    })
    .then(user => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_id', user.user_id);
        localStorage.setItem('username', user.username);
        
        window.location.href = "dashboard.html";
    })
    .catch(err => {
        alert(err.message);
    });
}