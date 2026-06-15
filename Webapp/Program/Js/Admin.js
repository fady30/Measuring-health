const stappendoelBtn = document.getElementById("stappendoelBtn")
const text = document.getElementById("text")

const SlaapUrenInput = document.getElementById("SlaapUrenInput")
const SlaapUrenBtn = document.getElementById("SlaapUrenBtn")

const hartslagBtn = document.getElementById("hartslagBtn")

console.log("Token:", localStorage.getItem("token"));


SlaapUrenBtn.addEventListener("click",  async(e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");

    const SlaapUren = document.getElementById("SlaapUrenInput").value;

    const response = await fetch("https://localhost:3000/health-data", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

    const token = localStorage.getItem("token");
    console.log("Token in goals fetch:", token);

    const response = await fetch("https://localhost:3000/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");

    const Hartslag = document.getElementById("hartslagInput").value;

    const response = await fetch("https://localhost:3000/health-data", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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