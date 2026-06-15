const Hartslagtext = document.getElementById("HartslagGrootText")
const hartslagusername = document.getElementById("hartslagusername")


async function loadhartslag() {

    const response = await authFetch("https://localhost:3000/health-data");

    const healthdata = await response.json();
    console.log(healthdata);

    if (healthdata.length > 0) {
        Hartslagtext.textContent = healthdata[0].hartslag;
    } else {
        Hartslagtext.textContent = "Geen data";
    }

    const response2 = await authFetch("https://localhost:3000/users/me");

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
