// Sayfa yüklendiğinde scroll pozisyonunu en üste getirir
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}
// Sayfa tamamen yüklendikten sonra en üste getir (stiller yüklenmeden düzen hesaplatmamak için)
window.addEventListener("load", () => window.scrollTo(0, 0));

// =====================================================
// Arama Kutusu (index.html ve tarif sayfalarında ortak)
// Yeni tarif eklerken SADECE bu listeye satır ekle.
// url: pages klasörüne göre dosya adı yazılır.
// =====================================================
const ARAMA_LISTESI = [
  { title: "Template", url: "template.html" },
  { title: "Ekmek", url: "ekmek.html" },
  { title: "Lavaş", url: "lavas.html" },
  { title: "Simit", url: "simit.html" },
  { title: "Ramazan Pidesi", url: "ramazan-pidesi.html" },
  { title: "Limonlu Kek", url: "limonlu-kek.html" },
  { title: "Kurabiye", url: "kurabiye.html" },
  { title: "Beyaz Peynir", url: "beyaz-peynir.html" },
  { title: "Kaşar Peyniri", url: "kasar-peyniri.html" },
  { title: "Acuka", url: "acuka.html" },
  { title: "Pirinç Pilavı", url: "pirinc-pilavi.html" },
  { title: "Bulgur Pilavı", url: "bulgur-pilavi.html" },
  { title: "Çiğ Köfte", url: "cig-kofte.html" },
  { title: "Yoğurt", url: "yogurt.html" },
  { title: "Muhallebi", url: "muhallebi.html" },
  { title: "Lokum", url: "lokum.html" },
  { title: "Kumpir", url: "kumpir.html" },
  { title: "Kahvaltı", url: "kahvalti.html" },
  { title: "Dondurma", url: "dondurma.html" },
  { title: "Izgara Tavuk", url: "izgara-tavuk.html" },
  { title: "Turşu", url: "tursu.html" },
  { title: "Zeytinyağlı Yaprak Sarma", url: "zeytinyagli-yaprak-sarma.html" },
  { title: "Kokoreç", url: "kokorec.html" },
  { title: "Taze Fasulye", url: "taze-fasulye.html" },
  { title: "Su Muhallebisi", url: "su-muhallebisi.html" },
  { title: "Zeytin", url: "zeytin.html" },
  { title: "Sucuk", url: "sucuk.html" },
  { title: "Lahmacun", url: "lahmacun.html" },
  { title: "Kıymalı Pide", url: "kiymali-pide.html" },
  { title: "Izgara Köfte", url: "izgara-kofte.html" },
  { title: "Adana Kebap", url: "adana-kebap.html" },
  { title: "Aşure", url: "asure.html" },
  { title: "Elektrolit", url: "elektrolit.html" },
  { title: "Pudra Şekeri", url: "pudra-sekeri.html" },
  { title: "Arnavut Ciğeri", url: "arnavut-cigeri.html" },
  { title: "Patlıcan Mezesi", url: "patlican-mezesi.html" },
  { title: "Ketçap", url: "ketcap.html" },
  { title: "Mayonez", url: "mayonez.html" },
  { title: "Patates Püresi", url: "patates-puresi.html" },
  { title: "Cezerye", url: "cezerye.html" },
  { title: "Brownie", url: "brownie.html" },
  { title: "Domates Salçası", url: "domates-salcasi.html" },
  { title: "Çikolata", url: "cikolata.html" },
  { title: "Ispanak", url: "ispanak.html" },
  { title: "Salamura Yeşil Zeytin", url: "salamura-yesil-zeytin.html" },
  { title: "Enerji Barı", url: "enerji-bari.html" },
  { title: "Patlamış Mısır", url: "patlamis-misir.html" },
  { title: "Bar Kaplama Karameli", url: "bar-kaplma-karameli.html" },
  { title: "Fıstık Ezmesi", url: "fistik-ezmesi.html" },
];

function search() {
  // Tarif sayfasında "searchInput", ana sayfada "index-searchInput" kullanılır
  const aramaKutusu = document.getElementById("searchInput") || document.getElementById("index-searchInput");
  const resultsContainer = document.getElementById("results");
  if (!aramaKutusu || !resultsContainer) return;

  // Ana sayfa pages klasörünün dışında olduğu için linklere "pages/" eklenir
  const klasor = aramaKutusu.id === "index-searchInput" ? "pages/" : "";
  const searchTerm = aramaKutusu.value.toLowerCase();

  // Sonuçlar alanını temizle
  resultsContainer.innerHTML = "";

  // Arama terimine göre filtrele
  const results = ARAMA_LISTESI.filter((item) => item.title.toLowerCase().includes(searchTerm));

  // Sonuçları göster
  if (results.length > 0 && searchTerm !== "") {
    resultsContainer.style.display = "block";
    results.forEach((item) => {
      const resultItem = document.createElement("p");
      const link = document.createElement("a");
      link.href = klasor + item.url;
      link.textContent = item.title;
      resultItem.appendChild(link);
      resultsContainer.appendChild(resultItem);
    });
  } else {
    resultsContainer.style.display = "none";
  }
}

(function () {
  const aramaKutusu = document.getElementById("searchInput") || document.getElementById("index-searchInput");
  if (!aramaKutusu) return;

  // Arama kutusundan çıkıldığında sonuçları gizle
  aramaKutusu.addEventListener("blur", function () {
    setTimeout(() => {
      const sonuclar = document.getElementById("results");
      if (sonuclar) sonuclar.style.display = "none";
    }, 200);
  });

  // Arama kutusuna yeniden odaklanıldığında, sonuç varsa göster
  aramaKutusu.addEventListener("focus", function () {
    const sonuclar = document.getElementById("results");
    if (sonuclar && sonuclar.innerHTML.trim() !== "") {
      sonuclar.style.display = "block";
    }
  });
})();

// =====================================================
// Açılır/kapanır malzeme açıklamaları (akordeon)
// =====================================================
document.querySelectorAll(".cell-header").forEach((baslik) => {
  baslik.addEventListener("click", (e) => {
    const aciklama = baslik.nextElementSibling;
    if (!aciklama) return; // Açıklaması olmayan satırlarda hata vermesin

    // Hidrasyon yüzdesi kutusuna ve seçenekli malzeme satırının "değiştir" düğmesine tıklamak akordiyonu etkilemez
    if (e.target.closest(".custom-input, .degistir")) return;

    baslik.classList.toggle("active");
    if (baslik.classList.contains("active")) {
      aciklama.style.maxHeight = aciklama.scrollHeight + "px";
    } else {
      aciklama.style.maxHeight = 0;
    }
  });
});

// =====================================================
// Kaydırma ipucu: kartın altında devam eden içerik varsa alt kenar hafifçe solar
// (kaydırma çubuğu gizli olduğu için okuyucu içeriğin devam ettiğini fark etsin)
// =====================================================
document.querySelectorAll(".table-container").forEach((kutu) => {
  const guncelle = () => {
    const kalan = kutu.scrollHeight - kutu.scrollTop - kutu.clientHeight;
    kutu.classList.toggle("devam-var", kalan > 4);
  };
  kutu.addEventListener("scroll", guncelle, { passive: true });
  window.addEventListener("resize", guncelle);
  window.addEventListener("load", guncelle);
  if (window.ResizeObserver) {
    const izleyici = new ResizeObserver(guncelle); // içerik uzayıp kısalınca (akordiyon açılınca) yeniden hesapla
    izleyici.observe(kutu);
    Array.from(kutu.children).forEach((cocuk) => izleyici.observe(cocuk));
  }
  guncelle();
});

// =====================================================
// Görsel gölgesi
// =====================================================
// Tüm ayarlar burada
const AYAR = {
  yukseklik: 0.18,  // gölge boyu (görsel genişliğine oranlı)
  genislik: 0.75,   // gölge eni: 1 = görselle aynı, küçültünce daralır
  kaydirY: 8,       // dikey kaydırma (%): + aşağı, - yukarı
  kaydirX: 0,       // yatay kaydırma (%): + sağa, - sola
  aci: 0,         // yatma açısı (derece): işaret yönü değiştirir
  blur: 4,          // bulanıklık (px)
  opaklik: 0.4,     // koyuluk
  dikeyTers: false,   // true: gölge ters çevrilir (zemin gölgesi), false: düz kalır
};

function golgeKur(img) {
  const kap = document.createElement('div');
  kap.className = 'golge-kap';
  kap.setAttribute('aria-hidden', 'true');

  const golge = img.cloneNode();
  golge.alt = '';
  kap.append(golge);
  img.before(kap);

  // sabit ayarlar
  kap.style.setProperty('--sx', AYAR.genislik);
  kap.style.setProperty('--ty', AYAR.kaydirY + '%');
  kap.style.setProperty('--tx', AYAR.kaydirX + '%');
  kap.style.setProperty('--aci', AYAR.aci + 'deg');
  kap.style.setProperty('--blur', AYAR.blur + 'px');
  kap.style.setProperty('--opak', AYAR.opaklik);
  kap.style.setProperty('--yon', AYAR.dikeyTers ? -1 : 1);
  

  // görselin en-boy oranına göre değişen ayar
  const hesapla = () => {
    const oran = img.naturalWidth / img.naturalHeight;
    kap.style.setProperty('--sy', Math.min(AYAR.yukseklik * oran, 1));
  };

  img.complete && img.naturalWidth ? hesapla() : img.addEventListener('load', hesapla);
}

document.querySelectorAll('.recipe-image img').forEach(golgeKur);
