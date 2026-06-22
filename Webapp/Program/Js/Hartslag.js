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

    const hartslagen = healthdata.map(item => item.hartslag);

    const hoogste = Math.max(...hartslagen);
    const rust = Math.min(...hartslagen);

    const som = hartslagen.reduce((a, b) => a + b, 0);
    const gemiddelde = Math.round(som / hartslagen.length);

    document.getElementById("hoogste").textContent = hoogste + " BPM";
    document.getElementById("rust").textContent = rust + " BPM";
    document.getElementById("gemiddelde").textContent = gemiddelde + " BPM";

    
}

loadhartslag()

//Slaapscore
setInterval(() => {
    loadhartslag();
}, 1000);
