const register_form = document.getElementById("register_form");

const TologinFromRegister = document.getElementById("TologinFromRegister");

register_form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const naam = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const wachtwoord = document.getElementById("wachtwoord").value;

    const response = await fetch("https://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            naam: naam,
            email: email,
            password: wachtwoord,
            geboortedatum: "2000-01-01"
        })
    });

    const data = await response.json();

    if (response.ok) {
        const loginResponse = await fetch("https://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: wachtwoord
            })
        });

        const loginData = await loginResponse.json();
        localStorage.setItem("token", loginData.accessToken);

        const randomMac = Array.from({length: 6}, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
        ).join(':');

        const deviceResponse = await fetch("https://localhost:3000/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${loginData.accessToken}` },
            body: JSON.stringify({
                naam: "test device",
                macAdres: randomMac,
                firmwareVersie: "1.0.0"
            })
        });

        const device = await deviceResponse.json();
        localStorage.setItem("deviceId", device.id);

        await fetch("https://localhost:3000/goals", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${loginData.accessToken}`
        },
        body: JSON.stringify({
            type: "stappendoel",
            streefwaarde: 10000
            })
        });


        window.location = "Dashboard.html";
    } else {
        alert("Registreren mislukt: " + data.message);
    }
});



TologinFromRegister.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = 'login.html'
})