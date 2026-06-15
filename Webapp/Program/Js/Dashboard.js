const ctx = document.getElementById('slaapChart').getContext('2d');

const StepscounterDashboard = document.getElementById("StepscounterDashboard")
const ProgressbarStepscounter = document.getElementById("Progressbar-Stepscounter")
const dashboardname = document.getElementById("dashboardname")


async function loaddashboard() {

    //Stepscounter
    const response = await authFetch("https://localhost:3000/goals");

    const goals = await response.json();
    const stappendoel = goals.find(g => g.type === "stappendoel");
    const StepscounterDashboardGoal = stappendoel ? stappendoel.streefwaarde : 10000;



    const StepscounterPercentage = (1000/StepscounterDashboardGoal)*100

    StepscounterDashboard.textContent = "1000/" + StepscounterDashboardGoal;
    ProgressbarStepscounter.style.width = StepscounterPercentage + "%";

    //userinfo
    const response2 = await authFetch("https://localhost:3000/users/me");

    const userinfo = await response2.json();
    console.log("userinfo:", userinfo);
    const userName = userinfo.naam;

    dashboardname.textContent = "Hoi " + userName;

    //Slaapscore
    





}






const Dashboardchart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
        datasets: [{
            data: [6, 7, 5, 8, 7, 9, 6],
            backgroundColor: '#C1E1C1',
            borderColor: '#4B5563',
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                min: 0,
                max: 10
            }
        }
    }
});



async function LoadSleepscore7Days() {
    var today = new Date();
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);


    const response = await authFetch("https://localhost:3000/health-data");

    const healthdata = await response.json();
    const last7days = healthdata
        .filter(item => new Date(item.gemetenOp) >= sevenDaysAgo)
        .sort((a, b) => new Date(a.gemetenOp) - new Date(b.gemetenOp));

    const perDag = {};
    last7days.forEach(item => {
        const dag = new Date(item.gemetenOp).toLocaleDateString('nl-NL', { weekday: 'short' });
        perDag[dag] = item.slaapuren;
    });

    const labels = Object.keys(perDag);
    const slaapdata = Object.values(perDag);

    Dashboardchart.data.labels = labels;
    Dashboardchart.data.datasets[0].data = slaapdata;
    Dashboardchart.update();
}
LoadSleepscore7Days();
loaddashboard();


setInterval(() => {
    LoadSleepscore7Days();
    loaddashboard();
}, 1000);

