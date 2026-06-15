const Hartslagtext = document.getElementById("HartslagGrootText")
const hartslagusername = document.getElementById("hartslagusername")


async function loadhartslag() {

    const token = localStorage.getItem("token")

    const response = await fetch("https://localhost:3000/health-data", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const healthdata = await response.json();
    console.log(healthdata);

    if (healthdata.length > 0) {
        Hartslagtext.textContent = healthdata[0].hartslag;
    } else {
        Hartslagtext.textContent = "Geen data";
    }

    const response2 = await fetch("https://localhost:3000/users/me", {
         headers: { "Authorization": `Bearer ${token}` }
    });

    const userdata = await response2.json();
    const username = userdata.naam;

    hartslagusername.textContent = "Hoi " + username


    //Slaapscore
    
}

loadhartslag()

//Slaapscore
setInterval(() => {
    loadhartslag();
}, 1000);
