import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
getDoc,
updateDoc,
deleteField,
collection,
query,
where,
getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

onAuthStateChanged(auth, async (user)=>{

console.log("onAuthStateChanged発火");
console.log(user);

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

if(user){

console.log("Firestore取得開始");

const userSnap = await getDoc(
  doc(db, "users", user.uid)
);

console.log("exists?", userSnap.exists());

if(userSnap.exists()){

  const coupleId =
  userSnap.data().coupleId;

  if(coupleId){

    const coupleSnap = await getDoc(
      doc(db,"couples",coupleId)
    );

    console.log(
      "couple exists?",
      coupleSnap.exists()
    );

    if(coupleSnap.exists()){
      
      events = coupleSnap.data().events || {};
      console.log("Firesore読み込み成功",events);
      
      createCalendar();
    }
    
  }

}

}

});

let events = JSON.parse(localStorage.getItem("events")) || {}

/*

function setPrincess() {
  document.body.className = "princess";
  localStorage.setItem("theme", "princess");
}

function setPrince() {
  document.body.className = "prince";
  localStorage.setItem("theme", "prince");
}

window.setPrincess = setPrincess;
window.setPrince = setPrince;

*/

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

console.log("createCalendar実行")

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

alert("addEvent動いた！");

const date = document.getElementById("eventDate").value
const type = document.getElementById("eventType").value
const text = document.getElementById("eventText").value

let icon="📅"

if(type==="date") icon="❤️"
if(type==="anniversary") icon="🎁"

events[date] = icon+" "+text

localStorage.setItem("events", JSON.stringify(events))

const user = auth.currentUser;

const docSnap = await getDoc(
  doc(db,"users",user.uid)
);

const coupleId =
docSnap.data().coupleId;

console.log("user =", user);

try{

if(user){

   console.log("Firestore保存開始");

   await setDoc(
      doc(db,"couples",coupleId),
      {
         events: events
      },
      { merge: true }
   );

   console.log("Firestore保存成功");

}else{

   console.log("ログインしてない");

}

}catch(error){

   console.error("Firestoreエラー", error);

}

console.log(events)

createCalendar()

}

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

async function deleteEvent(key){

if(confirm("予定を削除しますか？")){

delete events[key]

localStorage.setItem(
"events",
JSON.stringify(events)
)

const user = auth.currentUser;

if(user){

  const userSnap = await getDoc(
    doc(db,"users",user.uid)
  );

  const coupleId =
  userSnap.data().coupleId;

  await setDoc(
    doc(db,"couples",coupleId),
    {
      events: events
    },
    { merge: true }
  );

  console.log("Firestore削除保存成功");

}

createCalendar()

}

}

window.deleteEvent = deleteEvent;

async function createCouple(){

  const user = auth.currentUser;

  if(!user){
    alert("ログインしてください");
    return;
  }

  const docSnap = await getDoc(
    doc(db,"users",user.uid)
  );

  if(docSnap.exists()
    && docSnap.data().coupleId){
    alert(
      "すでにコードが発行されています。\n\n" +
      docSnap.data().coupleId
    );

  return;
  }

  const coupleId =
  Math.random().toString(36)
  .substring(2,8)
  .toUpperCase();

  await setDoc(
    doc(db,"users",user.uid),
    {
      events: events,
      coupleId: coupleId
    },
    { merge: true }
  );

  await setDoc(
    doc(db,"couples",coupleId),
    {
      events: {}
    }
  );

  console.log("couples作成成功");

  alert("カップルコード: " + coupleId);

}

window.createCouple = createCouple;

async function joinCouple(){

  const code = document.getElementById("CoupleCode")
  .value
  .trim();

  if(code === ""){
    alert("IDが未入力です。");
    return;
  }

  const user = auth.currentUser;

  if(!user){
    alert("ログインしてください。");
    return;
  }

  const q = query(
    collection(db,"users"),
    where("coupleId","==",code)
  );

  const querySnapshot = await getDocs(q);

  if(querySnapshot.empty){
    alert("CoupleCodeが見つかりませんでした。");
    return;
  }

  const foundUser = querySnapshot.docs[0];

  if(foundUser.id === user.uid){
    alert("自分が発行したコードは使用できません。");
    return;
  }

  await setDoc(
    doc(db,"users",user.uid),
    {
      coupleId: code
    },
    { merge: true }
  );

  alert("CoupleLink完了！")

}

window.joinCouple = joinCouple;

async function unlinkCouple(){

  const user = auth.currentUser;

  if(!user){
    alert("ログインしてください");
    return;
  }

  const docSnap = await getDoc(
    doc(db,"users",user.uid)
  );

  if(
    !docSnap.exists() ||
    !docSnap.data().coupleId
  ){
    alert("このアカウントはリンクしていません。")
    return;
  }

  if(!confirm(
    "⚠ CoupleLinkを解除します。\n\n本当に解除しますか？")){
    return;
  }

  await updateDoc(
    doc(db,"users",user.uid),
    {
      coupleId: deleteField()
    }
  );

  alert("CoupleLink解除完了");

}

window.unlinkCouple = unlinkCouple; 

function toggleMenu(event) {

    if(event){
        event.stopPropagation();
    }

    document
        .getElementById("sideMenu")
        .classList.toggle("open");
    
    document
        .getElementById("sideMenuOuter")
        .classList.toggle("open");

    document
        .getElementById("overlay")
        .classList.toggle("show");

    document
        .querySelector(".menu-btn")
        .classList.toggle("open");
}

window.toggleMenu = toggleMenu;

function closeMenu() {

    document
        .getElementById("sideMenu")
        .classList.remove("open");

    document
        .getElementById("sideMenuOuter")
        .classList.remove("open"); 

    document
        .getElementById("overlay")
        .classList.remove("show");

    document
        .querySelector(".menu-btn")
        .classList.remove("open");
}

window.closeMenu = closeMenu;