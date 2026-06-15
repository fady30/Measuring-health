const logoutbutton = document.getElementById("logout-button")
const changeName = document.getElementById("changeName");
const changeEmail = document.getElementById("changeEmail");
const changePassword = document.getElementById("changePassword");
const changeStepgoal = document.getElementById("changeStepgoal");

logoutbutton.addEventListener("click", (e) => {
    e.preventDefault();
    clearSession();
    window.location = "Register.html"

})


async function Loadprofile() {
    const response = await authFetch("https://localhost:3000/users/me");

    const Userdata = await response.json();
    const usernaam = Userdata.naam;
    const useremail = Userdata.email;
    

    profilename.textContent = usernaam
    profileemail.textContent = useremail

    
}

Loadprofile();


changeName.addEventListener("click", async(e) => {
    e.preventDefault();
    const input = prompt("Verander uw naam: ");


    const response = await authFetch("https://localhost:3000/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            naam: input
        })
    });

    Loadprofile()
});

changeEmail.addEventListener("click", async(e) => {
    e.preventDefault();
    const input = prompt("Verander uw Email: ");


    const response = await authFetch("https://localhost:3000/auth/login", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: input
        })
    });

    if (!response.ok){
        const error = await response.json();
        console.log(error);
        return
    }
    Loadprofile()
})


changePassword.addEventListener("click", async(e) => {
    e.preventDefault();
    const input = prompt("Verander uw wachtwoord (en onthoud het goed): ");


    const response = await authFetch("https://localhost:3000/auth/login", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            wachtwoord: input
        })
    });

    if (!response.ok){
        const error = await response.json();
        console.log(error);
        return
    }
})



changeStepgoal.addEventListener("click", async(e) => {
    e.preventDefault();
    const response = await authFetch("https://localhost:3000/goals");
    //console.log(response.status);
    //console.log(await response.json());

    const goals = await response.json();
    const stappendoel = goals.find(g => g.type === "stappendoel");
    console.log(stappendoel);
    console.log(stappendoel.id);

    
    const input = prompt("Verander stappendoel: Nu is dat: " + stappendoel.streefwaarde );
    const response2 = await authFetch(`https://localhost:3000/goals/${stappendoel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            streefwaarde: Number(input)
        })
    });
    if (!response2.ok){
        const error = await response2.json();
        console.log(error);
        return
    }
})

