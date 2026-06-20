function signup(event) {
    event.preventDefault();

    const username = document.getElementById('signUpUsername').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const confirmPass = document.getElementById('signUpPassConfirm').value;
    const signUpModal = new bootstrap.Modal(document.getElementById('signUpModal'));
    const signUpModalHeader = document.getElementById('signUpModalHeader');
    const signUpModalTitle = document.getElementById('signUpModalTitle');
    const signUpModalBody = document.getElementById('signUpModalBody');
    const signUpModalFooter = document.getElementById('signUpModalFooter');


    function showErrorModal(message) {
        signUpModalHeader.className = "modal-header bg-danger text-white";
        signUpModalTitle.innerHTML = "Sign Up Error";
        signUpModalBody.innerHTML = `<p>${message}</p>`;
        signUpModalFooter.innerHTML = `
            <button type="button" class="btn btn-theme-blue" data-bs-dismiss="modal">Close</button>
        `;
        signUpModal.show();
    }

       if (password !== confirmPass) {
        showErrorModal("Passwords do not match");
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
            showErrorModal("Username is taken");
            throw new Error('Username is taken');
        }
        else {
            showErrorModal("Server error occured");
            throw new Error('Server error occured');
        }
    })
    .then(data => {
        signUpModalHeader.className = "modal-header bg-success text-white"; 
        signUpModalTitle.innerHTML = "Sign Up Successful";
        signUpModalBody.innerHTML = `<p>Redirecting...</p>`;
        signUpModalFooter.innerHTML = ""; 
        signUpModal.show();
        setTimeout(()=> {signUpModal.hide(); window.location.href = "index.html"}, 3000);
    })
    .catch(err => {
        console.error("signup tracking error info: ", err);
        showErrorModal(`Failure: ${err}`);
        setTimeout(()=> signUpModal.hide(), 3000);
    });
}