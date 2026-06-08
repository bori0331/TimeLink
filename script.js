import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged,
getFirestore,
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNpU_CoLgRaNmOgGhQPvf_GUOhxMYcjc0",
  authDomain: "timelink-4f84b.firebaseapp.com",
  projectId: "timelink-4f84b",
  storageBucket: "timelink-4f84b.firebasestorage.app",
  messagingSenderId: "1049354480266",
  appId: "1:1049354480266:web:c529ead0a45c49984f5b73",
  measurementId: "G-PXCXBVS5G2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

async function login(){

try{

const result = await signInWithPopup(auth, provider)

const user = result.user

alert(
`ログイン成功！
${user.displayName}`
)

}

catch(error){

console.error(error)

alert(error.message)

}

}

async function logout(){

try{

await signOut(auth)

}catch(error){

console.error(error)

}

}

onAuthStateChanged(auth, (user)=>{

const loginBtn =
document.getElementById("loginBtn")

const profile =
document.getElementById("profile")

if(loginBtn && profile){

if(user){

loginBtn.style.display = "none"

profile.style.display = "block"

document.getElementById("userName").textContent =
user.displayName

document.getElementById("userPhoto").src =
user.photoURL

}else{

loginBtn.style.display = "block"

profile.style.display = "none"

}

}

});

let events = JSON.parse(localStorage.getItem("events")) || {}

function setPrincess() {
  document.body.className = "princess";
  localStorage.setItem("theme", "princess");
}

function setPrince() {
  document.body.className = "prince";
  localStorage.setItem("theme", "prince");
}

const savedTheme = localStorage.getItem("theme")

if(savedTheme){

document.body.className = savedTheme

}

let currentDate = new Date()

let year = currentDate.getFullYear()
let month = currentDate.getMonth()

const monthTitle = document.getElementById("monthYear")

if(monthTitle){
monthTitle.innerText = year + " / " + (month+1)
}

function createCalendar(){

const calendar = document.getElementById("calendar")

if(!calendar) return

calendar.innerHTML=""

const firstDay = new Date(year,month,1).getDay()
const lastDate = new Date(year,month+1,0).getDate()

for(let i=0;i<firstDay;i++){
calendar.innerHTML += "<div></div>"
}

for(let d=1; d<=lastDate; d++){

const monthStr = String(month + 1).padStart(2, "0");
const dayStr = String(d).padStart(2, "0");

const key = `${year}-${monthStr}-${dayStr}`;

const today = new Date()

const isToday =
year === today.getFullYear() &&
month === today.getMonth() &&
d === today.getDate()

let eventHTML=""

if(events[key]){
eventHTML =
`<div class="event"
onclick="deleteEvent('${key}')">
${events[key]}
</div>`
}

calendar.innerHTML +=
`
<div class="day ${isToday ? 'today' : ''}">
${d}
${eventHTML}
</div>
`
}

}

async function addEvent(){

const date = document.getElementById("eventDate").value
const type = document.getElementById("eventType").value
const text = document.getElementById("eventText").value

let icon="📅"

if(type==="date") icon="❤️"
if(type==="anniversary") icon="🎁"

events[date] = icon+" "+text

localStorage.setItem("events", JSON.stringify(events))

const user = auth.currentUser;

if(user){
   await setDoc(
    doc(db,"users",user.uid),
    {
      events: events
    }
   );
}

console.log(events)

createCalendar()

}

window.setPrincess = setPrincess;
window.setPrince = setPrince;
window.login = login;
window.logout = logout;
window.addEvent = addEvent;

createCalendar();

function prevMonth(){

month--

if(month < 0){
month = 11
year--
}

updateCalendar()

}

function nextMonth(){

month++

if(month > 11){
month = 0
year++
}

updateCalendar()

}

function updateCalendar(){

monthTitle.innerText =
year + " / " + (month + 1)

createCalendar()

}

window.prevMonth = prevMonth;
window.nextMonth = nextMonth;

function deleteEvent(key){

if(confirm("予定を削除しますか？")){

delete events[key]

localStorage.setItem(
"events",
JSON.stringify(events)
)

createCalendar()

}

}

window.deleteEvent = deleteEvent;