const homeButton = document.getElementById("home")
const HartslagButton = document.getElementById("Hartslag")
const ProfileButton = document.getElementById("Profile")
const Admin = document.getElementById("Admin")



HartslagButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = "Hartslag.html"

})

homeButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = "Dashboard.html"

})


ProfileButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = "Profile.html"
})

Admin.addEventListener("click", (e) =>{
    e.preventDefault();
    window.location = "Admin.html"
})