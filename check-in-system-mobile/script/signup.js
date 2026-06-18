function signup(event) {
    event.preventDefault();

    const username = document.getElementById('signUpUsername').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const confirmPass = document.getElementById('signUpPassConfirm').value;

    if (password !== confirmPass) {
        alert("Validation Error: Password do not match");
        return;
    }

    fetch('https://forsynthia.shares.zrok.io/check-in-system-api/signup.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (response.status === 201 || response.status === 200) {
            return response.json();
        }
        else if (response.status === 409) {
            throw new Error('Username is already taken');
        }
        else {
            throw new Error('Server error occured');
        }
    })
    .then(data => {
        alert("Sign Up Successful! Redirecting...");
        window.location.href = "index.html";
    })
    .catch(err => {
        alert(err.message);
        console.error("signup tracking error info: ", err);
    });
}