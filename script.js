const SERVICES = [
  {id:1,cat:"Hair",name:"Haircut & Style",min:45,price:35},
  {id:2,cat:"Hair",name:"Hair Colour (Full)",min:120,price:90},
  {id:3,cat:"Hair",name:"Keratin Treatment",min:150,price:130},
  {id:4,cat:"Skin",name:"Deep Cleansing Facial",min:60,price:55},
  {id:5,cat:"Skin",name:"Glow Facial + Mask",min:75,price:75},
  {id:6,cat:"Nails",name:"Classic Manicure",min:40,price:25},
  {id:7,cat:"Nails",name:"Gel Manicure + Pedicure",min:90,price:60},
  {id:8,cat:"Bridal",name:"Bridal Makeup Trial",min:90,price:100}
];
const STYLISTS = [
  {id:0,name:"Anyone available",role:"Fastest option",color:"#8d7a82",ini:"★"},
  {id:1,name:"Sara",role:"Senior stylist",color:"#b5546b",ini:"S"},
  {id:2,name:"Maya",role:"Colour specialist",color:"#7b6bb5",ini:"M"},
  {id:3,name:"Hina",role:"Skin therapist",color:"#2f8f6b",ini:"H"},
  {id:4,name:"Zoya",role:"Nail artist",color:"#d68a3c",ini:"Z"}
];
const TIMES = ["10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];
const LABELS = ["Service","Stylist","Date & time","Details"];

const state = {step:1,cat:"All",service:null,stylist:null,date:null,time:null};
const $ = id => document.getElementById(id);

function isTaken(dateKey,time){
  let h = 0; const s = dateKey+time+(state.stylist?state.stylist.id:0);
  for(let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) >>> 0;
  return h % 4 === 0;
}
const pad = n => String(n).padStart(2,"0");
const key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fmtLong = d => d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

function renderSteps(){
  $("steps").innerHTML = LABELS.map((l,i)=>{
    const n = i+1;
    const cls = state.step===n?"active":(state.step>n?"done":"");
    return `<div class="step ${cls}"><i>${state.step>n?"✓":n}</i><span>${l}</span></div>`;
  }).join("");
}

function renderCats(){
  const cats = ["All",...new Set(SERVICES.map(s=>s.cat))];
  $("cats").innerHTML = cats.map(c=>`<button class="chip ${c===state.cat?"active":""}" data-c="${c}">${c}</button>`).join("");
}
function renderServices(){
  const list = state.cat==="All"?SERVICES:SERVICES.filter(s=>s.cat===state.cat);
  $("services").innerHTML = list.map(s=>`
    <button class="service ${state.service&&state.service.id===s.id?"selected":""}" data-id="${s.id}">
      <div><h3>${s.name}</h3><span class="meta">${s.cat} &middot; ${s.min} min</span></div>
      <b>$${s.price}</b>
    </button>`).join("");
}
function renderStylists(){
  $("stylists").innerHTML = STYLISTS.map(s=>`
    <div class="stylist ${state.stylist&&state.stylist.id===s.id?"selected":""}" data-id="${s.id}" tabindex="0">
      <div class="avatar" style="background:${s.color}">${s.ini}</div>
      <strong>${s.name}</strong><small>${s.role}</small>
    </div>`).join("");
}
function renderDates(){
  const out = []; const base = new Date(); base.setHours(0,0,0,0);
  for(let i=0;i<14;i++){
    const d = new Date(base); d.setDate(base.getDate()+i);
    const off = d.getDay()===0 && false; 
    out.push({d,off});
  }
  $("dates").innerHTML = out.map(({d,off})=>`
    <div class="date ${state.date&&key(state.date)===key(d)?"selected":""} ${off?"off":""}" data-k="${key(d)}">
      <small>${d.toLocaleDateString("en-US",{weekday:"short"})}</small>
      <strong>${d.getDate()}</strong>
      <small>${d.toLocaleDateString("en-US",{month:"short"})}</small>
    </div>`).join("");
}
function renderSlots(){
  if(!state.date){ $("slots").innerHTML = `<p style="color:var(--muted)">Select a date to see available times.</p>`; return; }
  const k = key(state.date);
  const now = new Date();
  $("slots").innerHTML = TIMES.map(t=>{
    let past = false;
    if(k===key(now)){
      const [hm,ap] = t.split(" "); let [h] = hm.split(":").map(Number);
      if(ap==="PM" && h!==12) h+=12; if(ap==="AM" && h===12) h=0;
      past = h <= now.getHours();
    }
    const taken = past || isTaken(k,t);
    return `<div class="slot ${taken?"taken":""} ${state.time===t?"selected":""}" data-t="${t}">${t}</div>`;
  }).join("");
}

function renderSummary(){
  const rows = [
    ["Service", state.service?state.service.name:"—"],
    ["Duration", state.service?state.service.min+" min":"—"],
    ["Stylist", state.stylist?state.stylist.name:"—"],
    ["Date", state.date?fmtLong(state.date):"—"],
    ["Time", state.time||"—"]
  ];
  $("summary").innerHTML = rows.map(r=>`<div class="sum-row"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join("");
  $("total").textContent = "$"+(state.service?state.service.price:0);
}

function canContinue(){
  if(state.step===1) return !!state.service;
  if(state.step===2) return !!state.stylist;
  if(state.step===3) return !!(state.date&&state.time);
  return true;
}
function show(){
  document.querySelectorAll("[data-step]").forEach(s=>s.classList.toggle("hidden",Number(s.dataset.step)!==state.step));
  $("actions").classList.toggle("hidden",state.step===5);
  $("back").style.visibility = state.step===1?"hidden":"visible";
  $("next").textContent = state.step===4?"Confirm Booking":"Continue";
  $("next").disabled = !canContinue();
  renderSteps(); renderSummary();
  window.scrollTo({top:0,behavior:"smooth"});
}
function refresh(){ $("next").disabled = !canContinue(); renderSummary(); }

$("cats").onclick = e=>{ const b=e.target.closest(".chip"); if(!b) return; state.cat=b.dataset.c; renderCats(); renderServices(); };
$("services").onclick = e=>{ const b=e.target.closest(".service"); if(!b) return; state.service=SERVICES.find(s=>s.id==b.dataset.id); renderServices(); refresh(); };
$("stylists").onclick = e=>{ const b=e.target.closest(".stylist"); if(!b) return; state.stylist=STYLISTS.find(s=>s.id==b.dataset.id); state.time=null; renderStylists(); refresh(); };
$("stylists").onkeydown = e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); e.target.click(); } };
$("dates").onclick = e=>{
  const b=e.target.closest(".date"); if(!b||b.classList.contains("off")) return;
  const [y,m,d]=b.dataset.k.split("-").map(Number); state.date=new Date(y,m-1,d); state.time=null;
  renderDates(); renderSlots(); refresh();
};
$("slots").onclick = e=>{ const b=e.target.closest(".slot"); if(!b||b.classList.contains("taken")) return; state.time=b.dataset.t; renderSlots(); refresh(); };

$("back").onclick = ()=>{ if(state.step>1){ state.step--; if(state.step===3){renderDates();renderSlots();} show(); } };
$("next").onclick = ()=>{
  if(state.step===4){ return submit(); }
  state.step++;
  if(state.step===2) renderStylists();
  if(state.step===3){ renderDates(); renderSlots(); }
  show();
};

function submit(){
  const f = $("form").elements; let ok = true;
  document.querySelectorAll("[data-e]").forEach(x=>x.textContent="");
  const err = (k,m)=>{ document.querySelector(`[data-e="${k}"]`).textContent=m; ok=false; };
  if(f.name.value.trim().length<2) err("name","Please enter your name");
  if(!/^[0-9+\s-]{9,15}$/.test(f.phone.value.trim())) err("phone","Enter a valid phone number");
  if(!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) err("email","Enter a valid email address");
  if(!ok) return;

  const ref = "LUM-"+Math.random().toString(36).slice(2,7).toUpperCase();
  
  const nextBtn = $("next");
  nextBtn.disabled = true;
  nextBtn.textContent = "Sending Email...";

  const templateParams = {
    to_email: "saad.siddiqui4u2008@gmail.com",
    name: f.name.value.trim(),
    phone: f.phone.value.trim(),
    email: f.email.value.trim(),
    reply_to: f.email.value.trim(),
    notes: f.notes.value.trim() || "None",
    service: state.service.name,
    price: "$" + state.service.price,
    stylist: state.stylist.name,
    date: fmtLong(state.date),
    time: state.time,
    ref: ref
  };

  emailjs.send('service_wkvoy1t', 'template_b578rsz', templateParams)
    .then(function() {
       $("doneText").textContent = `Thank you ${f.name.value.trim()}! ${state.service.name} with ${state.stylist.name} on ${fmtLong(state.date)} at ${state.time}. We'll message you on ${f.phone.value.trim()} to confirm.`;
       $("ref").textContent = "Ref: "+ref;
       state.step=5; 
       show();
    }, function(error) {
       alert("EmailJS Error: " + (error.text || JSON.stringify(error)));
       console.error("EmailJS Error:", error);
       nextBtn.disabled = false;
       nextBtn.textContent = "Confirm Booking";
    });
}

$("restart").onclick = ()=>{
  Object.assign(state,{step:1,cat:"All",service:null,stylist:null,date:null,time:null});
  $("form").reset(); renderCats(); renderServices(); show();
};

$("y").textContent = new Date().getFullYear();
renderCats(); renderServices(); show();
