const stappendoelBtn = document.getElementById("stappendoelBtn")
const text = document.getElementById("text")

const SlaapUrenInput = document.getElementById("SlaapUrenInput")
const SlaapUrenBtn = document.getElementById("SlaapUrenBtn")

const hartslagBtn = document.getElementById("hartslagBtn")

console.log("Token:", localStorage.getItem("token"));


SlaapUrenBtn.addEventListener("click",  async(e) => {
    e.preventDefault();
    const deviceId = localStorage.getItem("deviceId");

    const SlaapUren = document.getElementById("SlaapUrenInput").value;

    const response = await authFetch("https://localhost:3000/health-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            deviceId: deviceId,
            stappen: 0,
            hartslag: 67,
            slaapuren: parseInt(SlaapUren),
            gemetenOp: new Date().toISOString()
        })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        alert("Data opgeslagen");
    } else {
        alert("Mislukt: " + data.message);
    }

})



stappendoelBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const Stappendoel = document.getElementById("stappendoel").value;

    const response = await authFetch("https://localhost:3000/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "stappendoel",
            streefwaarde: Number(Stappendoel)
        })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        alert("Data opgeslagen")
    } else {
        alert("Registreren mislukt: " + data.message);
    }
});



hartslagBtn.addEventListener('click', async(e) => {
    e.preventDefault();
    const deviceId = localStorage.getItem("deviceId");

    const Hartslag = document.getElementById("hartslagInput").value;

    const response = await authFetch("https://localhost:3000/health-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            deviceId: deviceId,
            stappen: 0,
            hartslag: parseInt(Hartslag),
            slaapuren: 0,
            gemetenOp: new Date().toISOString()
        })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
        alert("Data opgeslagen");
    } else {
        alert("Mislukt: " + data.message);
    }
});