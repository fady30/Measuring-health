const login_form = document.getElementById("Login_form");

const ToRegisterFromLogin = document.getElementById("ToRegisterFromLogin");

login_form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const wachtwoord = document.getElementById("wachtwoord").value;

    const loginResponse = await fetch("https://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            password: wachtwoord
        })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
        localStorage.setItem("token", loginData.accessToken);

        const deviceResponse = await fetch("https://localhost:3000/devices", {
            headers: { "Authorization": `Bearer ${loginData.accessToken}` }
        });

        const devices = await deviceResponse.json();
        console.log("Devices:", devices);

        if (devices.length > 0) {
            localStorage.setItem("deviceId", devices[0].id);
        }

        window.location = "Dashboard.html";
    } else {
        alert("Inloggen mislukt: " + loginData.message);
    }
});

ToRegisterFromLogin.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = 'Register.html';
});