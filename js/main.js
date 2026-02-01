const app = document.getElementById("app");
const mapArea = document.getElementById("mapArea");

const mapSelect = document.getElementById("mapSelect");
const dungeonSelect = document.getElementById("dungeonSelect");
const basementSelect = document.getElementById("basementSelect");

const assistSkill = document.getElementById("assistSkill");
const timer = document.getElementById("timer");
const body = document.body;


const hunterSelect = document.getElementById("hunterSelect");
const hunterSkillsBox = document.getElementById("hunterSkills");

let mapsData = {};
let hunterData = {};
let cooldownTimer = null;

/* 初始化 */
init();

function init() {
  loadMaps();
  loadHunters();
  bindEvents();
}


function loadMaps() { /* 地圖 */
  fetch("data/maps.json")
    .then(r => r.json())
    .then(data => {
      mapsData = data;
      mapSelect.innerHTML = `<option value="">選擇地圖</option>`;
      Object.keys(data).forEach(name => {
        mapSelect.innerHTML += `<option>${name}</option>`;
      });
    });
}


function loadHunters() { /* 監管者資訊 */
  fetch("data/hunters.json")
    .then(r => r.json())
    .then(data => {
      hunterData = data;
      Object.keys(data).forEach(name => {
        hunterSelect.innerHTML += `<option>${name}</option>`;
      });
    });
}


function bindEvents() { /* 事件集合 */
  mapSelect.onchange = onMapChange;
  dungeonSelect.onchange = onDungeonChange;
  basementSelect.onchange = onBasementChange;
  hunterSelect.onchange = onHunterChange;
  mapArea.onclick = captureXY;
}


function onMapChange() { /* 地圖切換 */
  clearPins();
  const map = mapsData[mapSelect.value];
  dungeonSelect.disabled = basementSelect.disabled = !map;

  if (!map) {
    mapArea.innerHTML = `<div class="map-placeholder">尚未選擇地圖</div>`;
    return;
  }

  mapArea.innerHTML = `<img src="${map.image}">`;
  fillSelect(dungeonSelect, map.dungeons);
  fillSelect(basementSelect, map.basements);
}

function fillSelect(select, list) {
  select.innerHTML = `<option value="">請選擇</option>`;
  list.forEach((p, i) => {
    select.innerHTML += `<option value="${i}">${p.name}</option>`;
  });
}


function onDungeonChange() { /* 地窖標記 */
  clearPinByType("dungeon");  // 只清地窖，不動地下室

  const map = mapsData[mapSelect.value];
  const point = map?.dungeons[dungeonSelect.value];
  if (point) {
    placePin(point, "dungeon");
  }
}


function onBasementChange() { //地下室標
  clearPinByType("basement"); // 只清地下室，不動地窖

  const map = mapsData[mapSelect.value];
  const point = map?.basements[basementSelect.value];
  if (point) {
    placePin(point, "basement");
  }
}


function placePin(point, type) {
  if (!point) return;
  const pin = document.createElement("div");
  pin.className = `pin ${type}`;
  pin.style.left = point.x + "%";
  pin.style.top = point.y + "%";
  mapArea.appendChild(pin);
}

function clearPins() {
  mapArea.querySelectorAll(".pin").forEach(p => p.remove());
}

function clearPinByType(type) {
  mapArea.querySelectorAll(`.pin.${type}`).forEach(p => p.remove());
}



function startCooldown() { // 輔助技能 CD 
  clearInterval(cooldownTimer);

  const cd = Number(assistSkill.value);
  if (!cd) return;

  // 取得技能名稱（關鍵）
  const skillName = assistSkill.options[assistSkill.selectedIndex].text
    .replace(/（.*?）/, ""); // 去掉秒數

  let t = cd;

  timer.classList.remove("done");
  timer.classList.add("active");
  timer.textContent = `監管者【${skillName}】剩餘 ${t} 秒`;

  cooldownTimer = setInterval(() => {
    t--;

    if (t <= 0) {
      timer.textContent = `監管者【${skillName}】技能冷卻結束！`;
      timer.classList.remove("active");
      timer.classList.add("done");
      clearInterval(cooldownTimer);
    } else {
      timer.textContent = `監管者【${skillName}】剩餘 ${t} 秒`;
    }
  }, 1000);
}


/* 監管者技能 */
function onHunterChange() {
  hunterSkillsBox.innerHTML = "";
  const list = hunterData[hunterSelect.value];
  if (!list) return;

  list.forEach(skill => {
    hunterSkillsBox.innerHTML += `
      <div class="hunter-skill-card">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-cd">${skill.cd}s</span>
      </div>
    `;


  });
}


document.querySelectorAll('.select-wrap select').forEach(select => {
    select.addEventListener('change', () => {
        // 重新觸發動畫（重要）
        select.classList.remove('select-pop');
        void select.offsetWidth;
        select.classList.add('select-pop');
    });
});


/* 主題 */
function toggleTheme() {
  const icon = document.getElementById("themeIcon");

  if (body.dataset.theme === "dark") {
    // 切回淺色
    body.dataset.theme = "light";
    icon.style.opacity = 0;

    setTimeout(() => {
      icon.textContent = "☀️";
      icon.style.opacity = 1;
    }, 200);
  } else {
    // 切到深色
    body.dataset.theme = "dark";
    icon.style.opacity = 0;

    setTimeout(() => {
      icon.textContent = "🌙";
      icon.style.opacity = 1;
    }, 200);
  }
}




/* XY */
function captureXY(e) {
  const r = mapArea.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width * 100).toFixed(2);
  const y = ((e.clientY - r.top) / r.height * 100).toFixed(2);
  console.log(`x:${x}, y:${y}`);
}


document.querySelectorAll("#talentGroup .talent").forEach(talent => {
  talent.addEventListener("click", () => {
    const state = talent.dataset.state;
    talent.dataset.state = state === "checked" ? "none" : "checked";
  });
  talent.addEventListener("contextmenu", e => {
    e.preventDefault();
    const state = talent.dataset.state;
    talent.dataset.state = state === "crossed" ? "none" : "crossed";
  });
});

document.querySelectorAll("#noBorrowGroup .talent").forEach(item => {
  item.addEventListener("click", () => {
    item.classList.toggle("checked");
  });
});

function closeDeviceNotice() {
  const notice = document.getElementById("deviceNotice");
  if (!notice) return;
  notice.classList.add("closing");
  setTimeout(() => {
    notice.remove();
  }, 350);
}

window.toggleTheme = toggleTheme;
window.startCooldown = startCooldown;