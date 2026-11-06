// =====================================================
// recipe.js  -  Tarif sayfalarının ortak kodu
// Malzeme tablosu satırları ve gram hesaplamaları burada.
// Her tarif sayfası bu dosyayı yükler, kendi satırlarını
// sayfanın içinde (addMainRow, addNormalRow...) ekler.
// =====================================================

let anaMalzemeInput = null;
let anaMalzemeUnit = null;
const malzemeBody = document.getElementById("malzemeBody");

// Genel bilgi satırı: kart başlığının altında sabit durur (liste scroll olsa da kaymaz)
function addInfoRow(text) {
  const kutu = malzemeBody.closest(".table-container");
  let not = kutu.previousElementSibling;
  if (!not || !not.classList.contains("info-note")) {
    not = document.createElement("div");
    not.className = "info-note";
    kutu.before(not);
  }
  not.innerHTML = text;
}

// Uzun başlıklar "…" ile kısaltılınca tamamı, fareyle üzerine gelince görünsün
function baslikIpucu(row) {
  row.querySelectorAll(".baslik, label").forEach((el) => {
    el.title = el.textContent.trim();
  });
}

// Ana malzeme satırı (miktar buraya girilir, diğerleri yüzdeye göre hesaplanır)
function addMainRow(name, description = "") {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>
      <span class="cell-header"><span class="baslik">${name}</span></span>
      ${description ? `<span class="normal-text">${description}</span>` : ""}
    </td>
    <td class="input-hucre">
      <div class="input-container">
        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" id="anaMalzeme" name="anaMalzeme" placeholder="Miktar girin" autocomplete="off" />
        <span class="unit" id="anaMalzemeUnit" style="display: none">g</span>
      </div>
    </td>
  `;
  malzemeBody.appendChild(row);
  baslikIpucu(row);
  anaMalzemeInput = row.querySelector("#anaMalzeme");
  anaMalzemeUnit = row.querySelector("#anaMalzemeUnit");

  anaMalzemeInput.addEventListener("input", function (e) {
    let val = e.target.value;
    if (/[^0-9]/.test(val)) {
      e.target.value = val.replace(/[^0-9]/g, "");
      e.target.classList.add("error");
    } else {
      e.target.classList.remove("error");
    }
    if (/^-/.test(val)) {
      e.target.value = "";
      return;
    }
    if (val.length > 4) {
      e.target.value = val.slice(0, 4);
    }
    e.target.value = e.target.value.replace(/^0+(\d)/, "$1");
    hesapla();
  });
  anaMalzemeInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") e.preventDefault();
  });
}

// Tüm satırların gramlarını ana malzemeye göre hesaplar
function hesapla() {
  if (!anaMalzemeInput) return;
  let miktar = parseInt(anaMalzemeInput.value);
  const hesapSonucList = document.querySelectorAll(".hesapSonuc");

  if (!miktar || miktar === 0) {
    anaMalzemeUnit.style.display = "none";
    hesapSonucList.forEach(el => el.textContent = "");
    return;
  }

  anaMalzemeUnit.style.display = "inline";
  hesapSonucList.forEach(el => {
    let sonuc = 0;
    if (el.dataset.type === "dropdown") {
      let select = document.getElementById(el.dataset.source);
      let yuzde = parseFloat(select.value);
      sonuc = miktar * yuzde / 100;
    } else if (el.dataset.type === "normal") {
      let yuzde = parseFloat(el.dataset.percent);
      sonuc = miktar * yuzde / 100;
    } else if (el.dataset.type === "custom") {
      let input = document.getElementById(el.dataset.source);
      let yuzde = parseFloat(input.value);
      if (!isNaN(yuzde)) {
        sonuc = miktar * yuzde / 100;
      }
    }

    if (sonuc >= 1) {
      sonuc = Math.round(sonuc);
    } else if (sonuc > 0) {
      sonuc = sonuc.toFixed(1);
    } else {
      sonuc = "";
    }
    el.textContent = sonuc ? sonuc + " g" : "";
  });
}

function generateId(prefix) {
  return prefix + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9));
}

// Normal malzeme satırı: ana malzemenin sabit yüzdesi
function addNormalRow(name, percent, description = "") {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>
      <span class="cell-header"><span class="baslik">${name}</span></span>
      ${description ? `<span class="normal-text">${description}</span>` : ""}
    </td>
    <td><span class="hesapSonuc" data-type="normal" data-percent="${percent}"></span></td>
  `;
  malzemeBody.appendChild(row);
  baslikIpucu(row);
  hesapla();
}

// =====================================================
// Seçenekli malzeme satırı (addDropdownRow)
// Başlık seçili seçeneği gösterir; yanındaki düğmeye her basışta seçenekler sırayla değişir
// (sonuncudan sonra başa döner). Düğme akordiyonu açıp kapatmaz.
// Başlık, en uzun seçeneğe göre sabit genişlik ayırır: seçenek değişince düğme yerinden oynamaz.
// Satır daralıp düğme yazısıyla sığmayınca düğme otomatik olarak simgeye döner.
// Her seçeneğin kendi açıklaması olabilir:
//   addDropdownRow([{ label: "Seçenek", value: 1, aciklama: "Bu seçeneğin açıklaması" }, ...], "Genel açıklama", "Düğme yazısı")
// "aciklama" yazılmayan seçenek, genel açıklamayı gösterir.
// =====================================================
// Gizli bir kopya ile doğal genişlik ölçer (aynı stiller uygulanır, ekranda görünmez)
function gizliOlc(kutu, kopya) {
  kopya.removeAttribute("id");
  kopya.style.cssText =
    "position:absolute;visibility:hidden;flex:none;width:auto;max-width:none;min-width:0;margin:0;overflow:visible;white-space:nowrap;";
  kutu.appendChild(kopya);
  const w = kopya.getBoundingClientRect().width;
  kopya.remove();
  return w;
}

const DAMLA_SIMGESI =
  '<svg class="ikon-simge" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';

const DEGISTIR_SIMGESI =
  '<svg class="ikon-simge" viewBox="0 0 24 24" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';

function addDropdownRow(options, description = "", dugmeYazisi = "Değiştir") {
  const selectId = generateId("dropdown_");
  const row = document.createElement("tr");
  row.classList.add("dropdown-row");
  const aciklamaVar = description || options.some((o) => o.aciklama);
  row.innerHTML = `
    <td>
      <span class="cell-header"><span class="baslik" id="${selectId}"></span><button type="button" class="degistir"><span class="yazi"></span>${DEGISTIR_SIMGESI}</button></span>
      ${aciklamaVar ? `<span class="normal-text"></span>` : ""}
    </td>
    <td><span class="hesapSonuc" data-type="dropdown" data-source="${selectId}"></span></td>
  `;
  malzemeBody.appendChild(row);

  const baslik = row.querySelector(".baslik");
  const dugme = row.querySelector(".degistir");
  const kutu = row.querySelector(".cell-header");
  const aciklama = row.querySelector(".normal-text");
  row.querySelector(".yazi").textContent = dugmeYazisi;
  dugme.setAttribute("aria-label", dugmeYazisi);
  let secili = 0;

  // Seçilen seçeneği başlığa ve açıklamaya yansıtır (akordiyonun açık/kapalı durumuna dokunmaz)
  function goster(i) {
    secili = i;
    baslik.textContent = options[i].label;
    baslik.title = options[i].label;
    baslik.value = String(options[i].value); // hesapla() değeri buradan okur
    if (aciklama) {
      aciklama.innerHTML = options[i].aciklama || description;
      if (kutu.classList.contains("active")) {
        aciklama.style.maxHeight = aciklama.scrollHeight + "px"; // açıksa yeni metne göre yüksekliği güncelle
      }
    }
  }

  let baslikGenislik = 0; // en uzun seçeneğin genişliği
  let dugmeGenislik = 0; // düğmenin yazılı halinin genişliği

  function olcumleriYap() {
    if (!kutu.clientWidth) return false; // gizliyse ölçülemez
    let en = 0;
    const kopya = baslik.cloneNode();
    options.forEach((o) => {
      kopya.textContent = o.label;
      en = Math.max(en, gizliOlc(kutu, kopya));
    });
    baslikGenislik = Math.ceil(en) + 1;
    baslik.style.flex = "0 1 " + baslikGenislik + "px"; // sabit yer ayır, yer daralırsa küçülebilir

    const dk = dugme.cloneNode(true);
    dk.classList.remove("ikon");
    dugmeGenislik = Math.ceil(gizliOlc(kutu, dk)) + 1;
    return true;
  }

  // Düğme yazısıyla sığıyorsa yazılı, sığmıyorsa simge olarak gösterilir
  function uydur() {
    const W = kutu.clientWidth;
    if (!W || !baslikGenislik) return;
    const bosluk = parseFloat(getComputedStyle(dugme).marginLeft) || 0; // .degistir margin-left (style.css)
    const sigiyor = baslikGenislik + bosluk + dugmeGenislik <= W;
    dugme.classList.toggle("ikon", !sigiyor);
    if (sigiyor) dugme.removeAttribute("title");
    else dugme.title = dugmeYazisi;
  }

  dugme.addEventListener("click", () => {
    goster((secili + 1) % options.length);
    hesapla();
    // Başlıkta kısa bir animasyon: değiştiği kolay fark edilsin (animasyon style.css içinde)
    baslik.classList.remove("degisti");
    void baslik.offsetWidth; // animasyonu baştan başlat
    baslik.classList.add("degisti");
  });
  baslik.addEventListener("animationend", () => baslik.classList.remove("degisti"));

  goster(0);
  hesapla();
  if (olcumleriYap()) uydur();
  if (window.ResizeObserver) new ResizeObserver(uydur).observe(kutu);
  // Yazı tipleri yüklenince genişlikler değişir: yeniden ölç
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (olcumleriYap()) uydur();
    });
  }
}

// Özel malzeme satırı (hidrasyon): yüzde kutusuna kullanıcı kendisi yazar
function addCustomRow(labelText, description = "") {
  const inputId = generateId("customInput_");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>
      <span class="cell-header">
        <label>${labelText}</label>
        <span class="hidrasyon"><span class="yazi">hidrasyon</span>${DAMLA_SIMGESI}</span>
        <input type="text" id="${inputId}" class="custom-input" placeholder="%">
      </span>
      ${description ? `<span class="normal-text">${description}</span>` : ""}
    </td>
    <td><span class="hesapSonuc" data-type="custom" data-source="${inputId}"></span></td>
  `;
  malzemeBody.appendChild(row);
  baslikIpucu(row);

  const input = document.getElementById(inputId);
  input.addEventListener("input", function (e) {
    let val = e.target.value;
    if (/[^0-9]/.test(val)) {
      e.target.value = val.replace(/[^0-9]/g, "");
      e.target.classList.add("error");
    } else {
      e.target.classList.remove("error");
    }
    if (val.length > 3) e.target.value = val.slice(0, 3);
    e.target.value = e.target.value.replace(/^0+(\d)/, "$1");
    hesapla();
  });

  // Satır daralıp hidrasyon yazısıyla sığmayınca kutu, yazısız damla simgesine döner
  const kutu = row.querySelector(".cell-header");
  const etiket = row.querySelector("label");
  const hidrasyon = row.querySelector(".hidrasyon");
  let toplam = 0; // etiket + yazılı hidrasyon kutusu + yüzde kutusu
  hidrasyon.setAttribute("aria-label", "hidrasyon");

  function olcumleriYap() {
    if (!kutu.clientWidth) return false; // gizliyse ölçülemez
    const yazili = hidrasyon.cloneNode(true);
    yazili.classList.remove("ikon");
    toplam =
      Math.ceil(gizliOlc(kutu, etiket.cloneNode(true))) + 1 +
      Math.ceil(gizliOlc(kutu, yazili)) + 1 +
      Math.ceil(input.getBoundingClientRect().width);
    return true;
  }

  function uydur() {
    const W = kutu.clientWidth;
    if (!W || !toplam) return;
    const bosluk = parseFloat(getComputedStyle(hidrasyon).marginLeft) || 0; // .hidrasyon margin-left (style.css)
    const sigiyor = toplam + bosluk <= W;
    hidrasyon.classList.toggle("ikon", !sigiyor);
    if (sigiyor) hidrasyon.removeAttribute("title");
    else hidrasyon.title = "hidrasyon";
  }

  if (olcumleriYap()) uydur();
  if (window.ResizeObserver) new ResizeObserver(uydur).observe(kutu);
  // Yazı tipleri yüklenince genişlikler değişir: yeniden ölç
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (olcumleriYap()) uydur();
    });
  }
  hesapla();
}

// Sayfa yüklenince miktar kutusunu temizle
window.addEventListener("load", () => {
  if (anaMalzemeInput) anaMalzemeInput.value = "";
  hesapla();
});
