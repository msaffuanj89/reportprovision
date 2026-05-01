const $ = id => document.getElementById(id);

function setToday(){
  if(!$("date").value){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const dd = String(today.getDate()).padStart(2,"0");
    $("date").value = `${yyyy}-${mm}-${dd}`;
  }
}

function formatDateMalay(value){
  if(!value) return "";
  const bulan = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];
  const d = new Date(value + "T00:00:00");
  if(isNaN(d)) return value;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function getImageDataUrls(){
  const imgs = [];
  ["p1","p2","p3","p4"].forEach((id, idx) => {
    const img = $(id);
    if(img && img.src && img.style.display === "block"){
      imgs.push({ slot: idx + 1, dataUrl: img.src });
    }
  });
  return imgs;
}

function inferProgramContext(programText){
  const p = (programText || "").toLowerCase();
  if(p.includes("karnival") && (p.includes("matematik") || p.includes("math"))){
    return {
      tujuan:"menarik minat murid terhadap Matematik melalui aktiviti interaktif, menyeronokkan dan mencabar minda",
      isu:"minat dan keyakinan murid terhadap Matematik masih perlu diperkukuh",
      fokus:"minat, keyakinan dan pemikiran Matematik",
      aktiviti:"aktiviti karnival, permainan Matematik, cabaran berkumpulan dan eksplorasi konsep"
    };
  }
  if(p.includes("matematik") || p.includes("math") || p.includes("sifir") || p.includes("mathquest")){
    return {
      tujuan:"memperkukuh kefahaman murid terhadap Matematik melalui pendekatan yang lebih terancang",
      isu:"penguasaan konsep dan kemahiran asas Matematik masih perlu dipertingkatkan",
      fokus:"penguasaan konsep, penyelesaian masalah dan intervensi Matematik",
      aktiviti:"perbincangan, aktiviti pengukuhan dan refleksi pembelajaran Matematik"
    };
  }
  if(p.includes("stem") || p.includes("robotik") || p.includes("3d") || p.includes("inovasi")){
    return {
      tujuan:"menggalakkan kreativiti, penyelesaian masalah dan pembelajaran berasaskan projek",
      isu:"murid memerlukan peluang mengaplikasikan pengetahuan secara praktikal",
      fokus:"reka bentuk, kreativiti, kolaborasi dan inovasi",
      aktiviti:"demonstrasi, hands-on, pembinaan prototaip dan pembentangan hasil"
    };
  }
  return {
    tujuan:"menyokong pelaksanaan program pendidikan yang lebih terancang",
    isu:"keperluan mengenal pasti isu pelaksanaan program dan tindakan susulan",
    fokus:"pelaksanaan program, dokumentasi dan penambahbaikan berterusan",
    aktiviti:"perbincangan, pelaksanaan aktiviti, dokumentasi dan refleksi program"
  };
}

function templateGenerate(){
  const program = $("program").value.trim() || "program ini";
  const school = $("school").value.trim() || "pihak sekolah";
  const institution = $("institution").value.trim() || "institusi";
  const ctx = inferProgramContext(program);

  $("issue").value = `Isu utama yang dikenal pasti melalui ${program} ialah ${ctx.isu}. Program ini memberi ruang kepada ${school} untuk meneliti keperluan sebenar dan merancang tindakan susulan.`;
  $("intro").value = `${program} dilaksanakan untuk ${ctx.tujuan}. Program ini turut menyokong usaha ${institution} memperkukuh kerjasama dengan ${school} melalui pelaksanaan aktiviti yang lebih tersusun.`;
  $("objective").value = `1. Meningkatkan ${ctx.fokus}.\n2. Menggalakkan penglibatan aktif peserta.\n3. Mengumpul evidens pelaksanaan program.\n4. Merancang penambahbaikan berdasarkan dapatan program.`;
  $("target").value = `Sasaran program melibatkan peserta yang berkaitan dengan pelaksanaan ${program}, termasuk guru, murid, pentadbir atau komuniti sekolah mengikut keperluan program.`;
  $("status").value = `Program dilaksanakan melalui ${ctx.aktiviti}. Pelaksanaan ini memberi ruang kepada peserta untuk terlibat secara aktif dan menghasilkan dapatan awal bagi tindakan susulan.`;
  $("outcome").value = `Program ini menghasilkan dapatan awal berkaitan ${ctx.fokus} serta menyediakan asas kepada penambahbaikan program dan pelaporan rasmi yang lebih sistematik.`;

  // CLEAN RULE: no image = no description. With image but no server = ask user to use server/hint, do not invent visual.
  applySmartFallbackDescriptions();

  updateReport();
}


function smartFallbackDescription(slot){
  const program = ($("program").value || "program").trim();
  const img = $("p" + slot);

  if(!img || !img.src || img.style.display !== "block"){
    return "";
  }

  return `Gambar menunjukkan satu situasi yang dirakam sebagai dokumentasi berkaitan ${program}.`;
}

function applySmartFallbackDescriptions(){
  ["1","2","3","4"].forEach(n => {
    const img = $("p" + n);
    const desc = $("desc" + n);

    if(img && img.src && img.style.display === "block"){
      if(!desc.value.trim()){
        desc.value = smartFallbackDescription(n);
      }
    } else {
      desc.value = "";
    }
  });
}

async function aiGenerate(){
  const images = getImageDataUrls();
  const isServer = location.protocol.startsWith("http") && location.hostname;

  // If no images, template is enough.
  if(images.length === 0){
    templateGenerate();
    return;
  }

  // Seamless offline mode: no popup, no interruption.
  // If app is opened directly, continue normally using Program + optional image hints.
  if(!isServer || location.protocol === "file:"){
    setAiMode("Offline Mode");
    templateGenerate();
    return;
  }

  const payload = {
    title: $("title").value || "",
    institution: $("institution").value || "",
    date: $("date").value || "",
    program: $("program").value || "",
    school: $("school").value || "",
    // removed hints

    images
  };

  const btns = document.querySelectorAll("button");
  btns.forEach(b => b.disabled = true);

  try{
    const res = await fetch("/api/vision-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "AI gambar gagal.");
    }

    const data = await res.json();
    setAiMode("AI Vision Ready");

    $("issue").value = data.issue || "";
    $("intro").value = data.intro || "";
    $("objective").value = data.objective || "";
    $("target").value = data.target || "";
    $("status").value = data.status || "";
    $("outcome").value = data.outcome || "";
    $("caption").value = data.caption || "";

    ["1","2","3","4"].forEach(n => {
      const img = $("p" + n);
      const hint = "";

      if(img && img.src && img.style.display === "block"){
        $("desc" + n).value = data["desc" + n] || smartFallbackDescription(n);
      } else {
        $("desc" + n).value = "";
      }
    });

    updateReport();
  }catch(e){
    console.warn("AI Vision unavailable. Switching to offline mode silently.", e);
    setAiMode("Offline Mode");
    templateGenerate();
    applySmartFallbackDescriptions();
  }finally{
    btns.forEach(b => b.disabled = false);
  }
}

function updateReport(){
  $("cTitle").innerText = $("title").value;
  $("cInstitution").innerText = $("institution").value;
  $("cDate").innerText = formatDateMalay($("date").value);

  $("metaLine").innerText = `${$("institution").value || ""} | ${formatDateMalay($("date").value)}`;
  $("photoSub").innerText = $("program").value;

  $("rProgram").innerText = $("program").value;
  $("rSchool").innerText = $("school").value;
  $("rIssue").innerText = $("issue").value;

  $("rIntro").innerText = $("intro").value;
  $("rObjective").innerText = $("objective").value;
  $("rTarget").innerText = $("target").value;
  $("rStatus").innerText = $("status").value;
  $("rOutcome").innerText = $("outcome").value;

  $("rCaption").innerText = $("caption").value;

  ["1","2","3","4"].forEach(n => {
    const img = $("p" + n);
    const desc = $("rDesc" + n);
    desc.innerText = $("desc" + n).value || "";
    desc.style.display = (img && img.src && img.style.display === "block" && $("desc" + n).value.trim()) ? "block" : "none";
  });
}

function clearPreview(){
  $("cTitle").innerText = "";
  $("cInstitution").innerText = "";
  $("cDate").innerText = formatDateMalay($("date").value);
  $("metaLine").innerText = "";
  $("photoSub").innerText = "";
  $("rProgram").innerText = "";
  $("rSchool").innerText = "";
  $("rIssue").innerText = "";
  $("rIntro").innerText = "";
  $("rObjective").innerText = "";
  $("rTarget").innerText = "";
  $("rStatus").innerText = "";
  $("rOutcome").innerText = "";
  $("rCaption").innerText = "";
  ["1","2","3","4"].forEach(n => $("rDesc" + n).innerText = "");
}

function saveDraft(){
  const ids = ["title","institution","date","program","school","issue","intro","objective","target","status","outcome","caption","desc1","desc2","desc3","desc4"];
  const data = {};
  ids.forEach(id => data[id] = $(id).value);
  ["p1","p2","p3","p4"].forEach(id => data[id] = $(id).src || "");
  data.imageState = imageState;
  localStorage.setItem("reportProVisionV12Draft", JSON.stringify(data));
  alert("Draft berjaya disimpan.");
}

function loadDraft(){
  const raw = localStorage.getItem("reportProVisionV12Draft");
  if(!raw){ alert("Tiada draft disimpan."); return; }
  const data = JSON.parse(raw);

  Object.keys(data).forEach(k => {
    if($(k) && $(k).tagName !== "IMG") $(k).value = data[k];
  });

  ["p1","p2","p3","p4"].forEach(id => {
    if(data[id]){
      $(id).src = data[id];
      $(id).style.display = "block";
      $(id).nextElementSibling.style.display = "none";
      if(data.imageState && data.imageState[id]){
        imageState[id] = data.imageState[id];
        const zoom = $("z" + id.replace("p",""));
        if(zoom) zoom.value = imageState[id].z || 1;
        applyImageTransform(id);
      }
    }
  });

  updateReport();
}

const imageState = {
  p1:{x:0,y:0,z:1}, p2:{x:0,y:0,z:1}, p3:{x:0,y:0,z:1}, p4:{x:0,y:0,z:1}
};

function applyImageTransform(imgId){
  const s = imageState[imgId];
  const img = $(imgId);
  if(img) img.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.z})`;
}

function setupImageAdjust(imgId, zoomId){
  const img = $(imgId);
  const zoom = $(zoomId);
  if(!img || !zoom) return;

  zoom.addEventListener("input", () => {
    imageState[imgId].z = Number(zoom.value);
    applyImageTransform(imgId);
  });

  let dragging = false;
  let startX = 0, startY = 0;
  let baseX = 0, baseY = 0;

  const start = (clientX, clientY) => {
    if(!img.src) return;
    dragging = true;
    startX = clientX;
    startY = clientY;
    baseX = imageState[imgId].x;
    baseY = imageState[imgId].y;
  };

  const move = (clientX, clientY) => {
    if(!dragging) return;
    imageState[imgId].x = baseX + (clientX - startX);
    imageState[imgId].y = baseY + (clientY - startY);
    applyImageTransform(imgId);
  };

  const end = () => dragging = false;

  img.addEventListener("mousedown", e => start(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", end);

  img.addEventListener("touchstart", e => {
    const t = e.touches[0];
    start(t.clientX, t.clientY);
  }, {passive:true});

  img.addEventListener("touchmove", e => {
    const t = e.touches[0];
    move(t.clientX, t.clientY);
  }, {passive:true});

  img.addEventListener("touchend", end);
}

function bindImage(inputId,imgId){
  $(inputId).addEventListener("change", e => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      $(imgId).src = ev.target.result;
      $(imgId).style.display = "block";
      $(imgId).nextElementSibling.style.display = "none";
      imageState[imgId] = {x:0,y:0,z:1};
      const zoom = $("z" + imgId.replace("p",""));
      if(zoom) zoom.value = 1;
      applyImageTransform(imgId);

      // Clean rule: upload new image clears old description for that slot.
      const n = imgId.replace("p","");
      $("desc" + n).value = "";
      updateReport();
    };
    reader.readAsDataURL(file);
  });
}

bindImage("img1","p1");
bindImage("img2","p2");
bindImage("img3","p3");
bindImage("img4","p4");

setupImageAdjust("p1","z1");
setupImageAdjust("p2","z2");
setupImageAdjust("p3","z3");
setupImageAdjust("p4","z4");

["title","institution","date","program","school","issue","intro","objective","target","status","outcome","caption","desc1","desc2","desc3","desc4"].forEach(id => {
  $(id).addEventListener("input", updateReport);
});

function checkContentFit(){
  const page = $("page2");
  if(!page) return true;
  const cards = page.querySelectorAll(".sectionCard p");
  let ok = true;
  cards.forEach(p => {
    if(p.scrollHeight > p.clientHeight + 2) ok = false;
  });
  if(!ok){
    alert("Isi laporan terlalu panjang untuk muat dalam 1 page. Ringkaskan bahagian yang panjang sebelum generate PDF.");
  }
  return ok;
}

function downloadPDF(){
  updateReport();
  checkContentFit();
  const opt = {
    margin: 0,
    filename: "report_pro_vision_v12_clean.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: "px", format: [1123, 794], orientation: "landscape" }
  };
  html2pdf().set(opt).from($("pdfArea")).save();
}

function openDrive(){
  window.open("https://drive.google.com/drive/my-drive", "_blank");
}

function scrollToPage(n){
  const page = $("page" + n);
  if(page) page.scrollIntoView({behavior:"smooth", block:"start"});
}


function setAiMode(mode){
  const el = $("aiModeStatus");
  if(!el) return;
  el.textContent = mode;
  el.className = "aiModeStatus " + (mode.includes("Vision") ? "visionOn" : "offlineOn");
}

async function detectAiMode(){
  if(location.protocol === "file:"){
    setAiMode("Offline Mode");
    return false;
  }

  try{
    const res = await fetch("/api/health", { cache: "no-store" });
    if(res.ok){
      const data = await res.json().catch(() => ({}));
      if(data.visionReady){
        setAiMode("AI Vision Ready");
        return true;
      }
    }
  }catch(e){}

  setAiMode("Offline Mode");
  return false;
}

// Auto-detect quietly on load and every 30 seconds
detectAiMode();
setInterval(detectAiMode, 30000);

setToday();
clearPreview();


function hideWelcomePage(){
  const welcome = document.getElementById("welcomePage");
  if(welcome) welcome.classList.add("hide");
}

document.addEventListener("DOMContentLoaded", () => {
  const enterBtn = document.getElementById("enterAppBtn");
  if(enterBtn) enterBtn.addEventListener("click", hideWelcomePage);

  // Auto masuk selepas beberapa saat supaya flow apps lebih lancar.
  setTimeout(hideWelcomePage, 4500);
});
