const $ = id => document.getElementById(id);
function uploadedImageCount(){
  return ["p1","p2","p3","p4"].filter(id => {
    const img = $(id);
    return img && img.src && img.style.display === "block";
  }).length;
}

function isPhoneDevice(){
  return window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 12000){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

function forceEnableMainButtons(){
  ["aiGenerateBtn","updatePreviewBtn","enterAppBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if(btn){
      btn.disabled = false;
      btn.removeAttribute("disabled");
    }
  });
}

function safeSetAiModeDefault(){
  const el = document.getElementById("aiModeStatus");
  if(el && (!el.textContent || el.textContent.includes("Checking"))){
    el.textContent = "Offline Mode";
    el.className = "aiModeStatus offlineOn";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  forceEnableMainButtons();
  safeSetAiModeDefault();
  setTimeout(() => {
    forceEnableMainButtons();
    safeSetAiModeDefault();
  }, 1200);
});


window.addEventListener("error", function(e){
  console.warn("Non-critical script error:", e.message);
});
function getApiBaseUrl(){
  const cfg = window.REPORT_PRO_CONFIG || {};
  return (cfg.API_BASE_URL || "").replace(/\/$/, "");
}
function apiUrl(path){
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}


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
  // INSTANT GENERATE MODE:
  // If phone OR many images uploaded, avoid long AI Vision wait.
  // Generate immediately using local template + smart fallback.
  if(isPhoneDevice() || uploadedImageCount() >= 3){
    const aiBtn = document.getElementById("aiGenerateBtn");
    if(aiBtn){
      aiBtn.disabled = true;
      aiBtn.textContent = "Generating...";
    }

    try{
      templateGenerate();
      applySmartFallbackDescriptions();
      updateReport();
      setAiMode(isPhoneDevice() ? "Phone Fast Mode" : "Instant Mode");
    }finally{
      if(aiBtn){
        aiBtn.disabled = false;
        aiBtn.textContent = "AI Generate Laporan";
      }
      forceEnableMainButtons();
    }
    return;
  }

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

  const btns = [];
  const aiBtn = document.getElementById("aiGenerateBtn");
  if(aiBtn){ aiBtn.disabled = true; aiBtn.textContent = "Generating..."; }

  try{
    const res = fetchWithTimeout("https://reportprovision.vercel.app/api/vision-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, 3500);

    if(!res.ok){
      const err = res.json().catch(() => ({}));
      throw new Error(err.error || "AI gambar gagal.");
    }

    const data = res.json();
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
    if(aiBtn){ aiBtn.disabled = false; aiBtn.textContent = "AI Generate Laporan"; }
    forceEnableMainButtons();
  }
}

function updatePhotoGridState(){
  const grid = document.querySelector(".photoGrid");
  if(!grid) return;
  grid.classList.remove("one","two","three","four");
  let count = 0;
  ["1","2","3","4"].forEach(n => {
    const img = $("p" + n);
    const card = img ? img.closest(".photoCard") : null;
    if(card){
      const hasImg = img && img.src && img.style.display === "block";
      card.classList.toggle("empty", !hasImg);
      if(hasImg) count++;
    }
  });
  if(count === 1) grid.classList.add("one");
  if(count === 2) grid.classList.add("two");
  if(count === 3) grid.classList.add("three");
  if(count >= 4) grid.classList.add("four");
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
  updatePhotoGridState();

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
        classifyImageOrientation(id);
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
      classifyImageOrientation(imgId);
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


function normalizeForPdf(){
  // default cover labels if user leaves blank
  if(!$("title").value.trim()) $("title").value = "Report Pro Vision";
  if(!$("institution").value.trim()) $("institution").value = "AI Report Generator";
  updateReport();

  // mark empty photo cards and set grid class according to uploaded count
  const grid = document.querySelector(".photoGrid");
  if(grid){
    grid.classList.remove("one","two","three","four");
    let count = 0;
    ["1","2","3","4"].forEach(n => {
      const img = $("p" + n);
      const card = img ? img.closest(".photoCard") : null;
      if(card){
        const hasImg = img && img.src && img.style.display === "block";
        card.classList.toggle("empty", !hasImg);
        if(hasImg) count++;
      }
    });
    if(count === 1) grid.classList.add("one");
    if(count === 2) grid.classList.add("two");
    if(count === 3) grid.classList.add("three");
    if(count >= 4) grid.classList.add("four");
  }
}

function classifyImageOrientation(imgId){
  const img = $(imgId);
  if(!img) return;

  const apply = () => {
    img.classList.remove("img-landscape","img-portrait","img-square");

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if(!w || !h) return;

    const ratio = w / h;

    if(ratio > 1.15){
      img.classList.add("img-landscape");
    }else if(ratio < 0.85){
      img.classList.add("img-portrait");
    }else{
      img.classList.add("img-square");
    }
  };

  if(img.complete) apply();
  else img.onload = apply;
}

function classifyAllImages(){
  ["p1","p2","p3","p4"].forEach(classifyImageOrientation);
}

async function downloadPDF(){
  updateReport();

  const pages = [
    document.getElementById("page1"),
    document.getElementById("page2"),
    document.getElementById("page3")
  ].filter(Boolean);

  if(pages.length !== 3){
    alert("Struktur laporan tidak lengkap. Pastikan page1, page2 dan page3 wujud.");
    return;
  }

  const pdfButton = document.querySelector(".pdf");
  if(pdfButton){
    pdfButton.disabled = true;
    pdfButton.textContent = "Generating PDF...";
  }

  document.body.classList.add("exporting");

  const stage = document.createElement("div");
  stage.id = "pdfExportStage";
  stage.style.position = "fixed";
  stage.style.left = "0";
  stage.style.top = "0";
  stage.style.width = "1123px";
  stage.style.height = "794px";
  stage.style.overflow = "hidden";
  stage.style.opacity = "0";
  stage.style.pointerEvents = "none";
  stage.style.zIndex = "-9999";
  stage.style.background = "#ffffff";
  document.body.appendChild(stage);

  try{
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if(!JsPDF || typeof html2canvas === "undefined"){
      throw new Error("Library PDF belum loaded. Refresh page dan cuba semula.");
    }

    const pdf = new JsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794],
      compress: true
    });

    for(let i = 0; i < pages.length; i++){
      stage.innerHTML = "";

      const clone = pages[i].cloneNode(true);
      clone.style.width = "1123px";
      clone.style.height = "794px";
      clone.style.margin = "0";
      clone.style.padding = window.getComputedStyle(pages[i]).padding;
      clone.style.boxShadow = "none";
      clone.style.transform = "none";
      clone.style.position = "relative";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.overflow = "hidden";
      clone.style.borderRadius = "0";

      // Remove report cover logo if any
      clone.querySelectorAll(".coverLogo").forEach(el => el.remove());

      // Remove UI only parts from PDF
      clone.querySelectorAll(".photoTools, .photoTools *, .phoneTabs, button, input, textarea").forEach(el => el.remove());
      
// REMOVE ALL UI TEXT IN PHOTO
clone.querySelectorAll(".photo span, .photoTools, .photoTools *").forEach(el => el.remove());

// EXTRA CLEAN: remove any leftover drag text
clone.querySelectorAll(".photo").forEach(photo => {
  const nodes = photo.querySelectorAll("*");
  nodes.forEach(el => {
    if(el.textContent && el.textContent.toLowerCase().includes("drag gambar")){
      el.remove();
    }
  });
});


      // Photo page cleanup
      if(clone.id === "page3"){
        clone.querySelectorAll(".photoCard").forEach(card => {
          const img = card.querySelector("img");
          const hasImage = img && img.getAttribute("src");
          if(!hasImage) card.remove();
        });

        clone.querySelectorAll(".photoDesc").forEach(el => {
          if(!el.textContent.trim()) el.remove();
        });

        clone.querySelectorAll(".captionBox").forEach(el => {
          if(!el.textContent.trim()) el.remove();
        });

        const grid = clone.querySelector(".photoGrid");
        if(grid){
          const count = grid.querySelectorAll(".photoCard").length;
          grid.classList.remove("one","two","three","four");
          if(count === 1) grid.classList.add("one");
          if(count === 2) grid.classList.add("two");
          if(count === 3) grid.classList.add("three");
          if(count >= 4) grid.classList.add("four");
        }
      }

      stage.appendChild(clone);

      new Promise(resolve => requestAnimationFrame(resolve));

      const canvas = html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1123,
        windowHeight: 794,
        width: 1123,
        height: 794,
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      if(i > 0) pdf.addPage([1123, 794], "landscape");
      pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);
    }

    pdf.save("report_pro_vision.pdf");
  }catch(e){
    console.error(e);
    alert("PDF gagal dijana: " + e.message);
  }finally{
    stage.remove();
    document.body.classList.remove("exporting");
    if(pdfButton){
      pdfButton.disabled = false;
      pdfButton.textContent = "Generate PDF";
    }
    if(typeof forceEnableMainButtons === "function") forceEnableMainButtons();
  }
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

function classifyImageOrientation(imgId){

  try{
    const res = fetch("https://reportprovision.vercel.app/api/health?ts=" + Date.now(), {
      cache: "no-store"
    });

    const data = res.json();
    console.log("AI HEALTH:", data);

    if(data.ok || data.visionReady){
      setAiMode("AI Vision Ready");
      forceEnableMainButtons();
    }
  }catch(e){
    console.error("AI HEALTH FAILED:", e);
  }

  setAiMode("Offline Mode");
  forceEnableMainButtons();
  return false;
}

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try{
    const res = fetch(apiUrl("/api/health"), {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if(res.ok){
      const data = res.json().catch(() => ({}));
     if(data.visionReady || data.ok){
  setAiMode("AI Vision Ready");
  forceEnableMainButtons();
}
    }
  }catch(e){
    clearTimeout(timeoutId);
  }

  setAiMode("Offline Mode");
  forceEnableMainButtons();

// Auto-detect quietly on load and every 30 seconds
detectAiMode();
setInterval(detectAiMode, 30000);

setToday();
clearPreview();



function hideWelcomePage(){
  if(window.enterReportApp) return window.enterReportApp();
  const welcome = document.getElementById("welcomePage");
  if(welcome){
    welcome.classList.add("hide");
    setTimeout(() => welcome.style.display = "none", 600);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const enterBtn = document.getElementById("enterAppBtn");
  if(enterBtn) enterBtn.addEventListener("click", hideWelcomePage);
  setTimeout(hideWelcomePage, 6000);
});

