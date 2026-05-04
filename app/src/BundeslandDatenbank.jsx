import { useState } from "react";

// ─── ÜBERSETZUNGEN für Behörden-Tab ────────────────────────────────────────
const BL_TEXT = {
  de: {
    heroTitle: "Behörde in Ihrer Stadt finden",
    heroSub: "Stadt eingeben → alle Behörden mit direkten Such-Links für Ihre Stadt!",
    cityLabel: "In welcher Stadt wohnen Sie?",
    cityPlaceholder: "Stadt eingeben z.B. Braunschweig",
    bundeslandPlaceholder: "— Bundesland (optional) —",
    chooseAuthority: "Welche Behörde brauchen Sie?",
    nationwideHelp: "Bundesweite Hotlines",
    behoerdeFinden: "Behörde finden",
    onMap: "Auf Karte zeigen",
    callPhone: "Anrufen",
    bundesweitTel: "Bundesweite 115 — Behörden-Hotline",
    writeLetter: "Brief schreiben",
    closeAuthority: "Andere Behörde",
    backToCity: "← Andere Stadt",
    chooseCity: "Bitte erst Stadt eingeben!",
    online: "Online-Portal",
    finder: "Suchportal",
    address: "Adresse",
    phone: "Telefon",
    findOnMap: "📍 Auf Google Maps anzeigen",
    writeBrief: "✍️ Brief an diese Behörde",
    importantHint: "💡 WICHTIG",
    hintText: "Lokale Behördennummern findest Du am besten direkt auf Google Maps. Die Stadtportale haben oft die aktuellsten Telefonnummern!",
  },
  en: {
    heroTitle: "Find authority in your city",
    heroSub: "Enter city → all authorities with direct search links!",
    cityLabel: "Which city do you live in?",
    cityPlaceholder: "Enter city e.g. Braunschweig",
    bundeslandPlaceholder: "— State (optional) —",
    chooseAuthority: "Which authority do you need?",
    nationwideHelp: "Nationwide hotlines",
    behoerdeFinden: "Find authority",
    onMap: "Show on map",
    callPhone: "Call",
    bundesweitTel: "Nationwide 115 — Authority hotline",
    writeLetter: "Write letter",
    closeAuthority: "Other authority",
    backToCity: "← Other city",
    chooseCity: "Please enter city first!",
    online: "Online portal",
    finder: "Search portal",
    address: "Address",
    phone: "Phone",
    findOnMap: "📍 Show on Google Maps",
    writeBrief: "✍️ Write letter to this authority",
    importantHint: "💡 IMPORTANT",
    hintText: "Local authority numbers are best found directly on Google Maps. City portals often have the most up-to-date phone numbers!",
  },
  ar: {
    heroTitle: "اعثر على الجهة في مدينتك",
    heroSub: "أدخل المدينة ← جميع الجهات مع روابط بحث مباشرة!",
    cityLabel: "في أي مدينة تسكن؟",
    cityPlaceholder: "أدخل المدينة مثلاً Braunschweig",
    bundeslandPlaceholder: "— الولاية (اختياري) —",
    chooseAuthority: "أي جهة تحتاج؟",
    nationwideHelp: "خطوط ساخنة على مستوى الاتحاد",
    behoerdeFinden: "اعثر على الجهة",
    onMap: "عرض على الخريطة",
    callPhone: "اتصل",
    bundesweitTel: "115 خط ساخن للجهات الحكومية",
    writeLetter: "كتابة رسالة",
    closeAuthority: "جهة أخرى",
    backToCity: "← مدينة أخرى",
    chooseCity: "الرجاء إدخال المدينة أولاً!",
    online: "البوابة الإلكترونية",
    finder: "بوابة البحث",
    address: "العنوان",
    phone: "الهاتف",
    findOnMap: "📍 عرض على خرائط جوجل",
    writeBrief: "✍️ كتابة رسالة لهذه الجهة",
    importantHint: "💡 مهم",
    hintText: "أفضل طريقة للعثور على أرقام الجهات المحلية هي عبر خرائط جوجل. بوابات المدينة لديها غالباً أحدث أرقام الهاتف!",
  },
  tr: {
    heroTitle: "Şehrinizdeki daireyi bulun",
    heroSub: "Şehir girin → tüm daireler doğrudan arama bağlantılarıyla!",
    cityLabel: "Hangi şehirde yaşıyorsunuz?",
    cityPlaceholder: "Şehir girin örn. Braunschweig",
    bundeslandPlaceholder: "— Eyalet (opsiyonel) —",
    chooseAuthority: "Hangi daireye ihtiyacınız var?",
    nationwideHelp: "Ülke çapında destek hatları",
    behoerdeFinden: "Daireyi bul",
    onMap: "Haritada göster",
    callPhone: "Ara",
    bundesweitTel: "Ülke çapında 115 — Daire destek hattı",
    writeLetter: "Mektup yaz",
    closeAuthority: "Başka daire",
    backToCity: "← Başka şehir",
    chooseCity: "Lütfen önce şehri girin!",
    online: "Çevrimiçi portal",
    finder: "Arama portalı",
    address: "Adres",
    phone: "Telefon",
    findOnMap: "📍 Google Haritalar'da göster",
    writeBrief: "✍️ Bu daireye mektup yaz",
    importantHint: "💡 ÖNEMLİ",
    hintText: "Yerel daire numaralarını en iyi Google Haritalar'da bulabilirsiniz. Şehir portalları genellikle en güncel telefon numaralarına sahiptir!",
  },
  fr: {
    heroTitle: "Trouver l'administration dans votre ville",
    heroSub: "Entrez la ville → toutes les administrations avec liens directs!",
    cityLabel: "Dans quelle ville habitez-vous?",
    cityPlaceholder: "Entrez la ville p.ex. Braunschweig",
    bundeslandPlaceholder: "— Land (optionnel) —",
    chooseAuthority: "De quelle administration avez-vous besoin?",
    nationwideHelp: "Hotlines nationales",
    behoerdeFinden: "Trouver l'administration",
    onMap: "Afficher sur la carte",
    callPhone: "Appeler",
    bundesweitTel: "115 — Hotline administrative nationale",
    writeLetter: "Écrire lettre",
    closeAuthority: "Autre administration",
    backToCity: "← Autre ville",
    chooseCity: "Veuillez d'abord entrer la ville!",
    online: "Portail en ligne",
    finder: "Portail de recherche",
    address: "Adresse",
    phone: "Téléphone",
    findOnMap: "📍 Afficher sur Google Maps",
    writeBrief: "✍️ Écrire à cette administration",
    importantHint: "💡 IMPORTANT",
    hintText: "Les numéros locaux se trouvent mieux directement sur Google Maps. Les portails de la ville ont souvent les numéros les plus actuels!",
  },
  es: {
    heroTitle: "Encontrar autoridad en su ciudad",
    heroSub: "Ingrese ciudad → todas las autoridades con enlaces directos!",
    cityLabel: "¿En qué ciudad vive?",
    cityPlaceholder: "Ingrese ciudad p.ej. Braunschweig",
    bundeslandPlaceholder: "— Estado (opcional) —",
    chooseAuthority: "¿Qué autoridad necesita?",
    nationwideHelp: "Líneas nacionales",
    behoerdeFinden: "Encontrar autoridad",
    onMap: "Mostrar en mapa",
    callPhone: "Llamar",
    bundesweitTel: "115 — Línea nacional de autoridades",
    writeLetter: "Escribir carta",
    closeAuthority: "Otra autoridad",
    backToCity: "← Otra ciudad",
    chooseCity: "¡Por favor ingrese la ciudad primero!",
    online: "Portal en línea",
    finder: "Portal de búsqueda",
    address: "Dirección",
    phone: "Teléfono",
    findOnMap: "📍 Mostrar en Google Maps",
    writeBrief: "✍️ Escribir a esta autoridad",
    importantHint: "💡 IMPORTANTE",
    hintText: "Los números locales se encuentran mejor en Google Maps. ¡Los portales de la ciudad tienen los números más actuales!",
  },
  ru: {
    heroTitle: "Найти орган в вашем городе",
    heroSub: "Введите город → все органы с прямыми ссылками поиска!",
    cityLabel: "В каком городе вы живёте?",
    cityPlaceholder: "Введите город напр. Braunschweig",
    bundeslandPlaceholder: "— Земля (опционально) —",
    chooseAuthority: "Какой орган вам нужен?",
    nationwideHelp: "Общефедеральные горячие линии",
    behoerdeFinden: "Найти орган",
    onMap: "Показать на карте",
    callPhone: "Позвонить",
    bundesweitTel: "115 — Общефедеральная горячая линия",
    writeLetter: "Написать письмо",
    closeAuthority: "Другой орган",
    backToCity: "← Другой город",
    chooseCity: "Пожалуйста сначала введите город!",
    online: "Онлайн-портал",
    finder: "Поисковый портал",
    address: "Адрес",
    phone: "Телефон",
    findOnMap: "📍 Показать на Google Maps",
    writeBrief: "✍️ Написать в этот орган",
    importantHint: "💡 ВАЖНО",
    hintText: "Местные номера лучше всего искать на Google Maps. Городские порталы часто имеют самые актуальные номера!",
  },
  uk: {
    heroTitle: "Знайти орган у вашому місті",
    heroSub: "Введіть місто → всі органи з прямими пошуковими посиланнями!",
    cityLabel: "У якому місті ви живете?",
    cityPlaceholder: "Введіть місто напр. Braunschweig",
    bundeslandPlaceholder: "— Земля (опціонально) —",
    chooseAuthority: "Який орган вам потрібен?",
    nationwideHelp: "Загальнонаціональні гарячі лінії",
    behoerdeFinden: "Знайти орган",
    onMap: "Показати на карті",
    callPhone: "Зателефонувати",
    bundesweitTel: "115 — Загальнонаціональна гаряча лінія",
    writeLetter: "Написати листа",
    closeAuthority: "Інший орган",
    backToCity: "← Інше місто",
    chooseCity: "Будь ласка, спочатку введіть місто!",
    online: "Онлайн-портал",
    finder: "Пошуковий портал",
    address: "Адреса",
    phone: "Телефон",
    findOnMap: "📍 Показати на Google Maps",
    writeBrief: "✍️ Написати до цього органу",
    importantHint: "💡 ВАЖЛИВО",
    hintText: "Місцеві номери найкраще шукати на Google Maps. Міські портали часто мають найактуальніші номери!",
  },
  fa: {
    heroTitle: "یافتن اداره در شهر شما",
    heroSub: "شهر را وارد کنید ← همه ادارات با لینک‌های مستقیم!",
    cityLabel: "در کدام شهر زندگی می‌کنید؟",
    cityPlaceholder: "شهر را وارد کنید مثلاً Braunschweig",
    bundeslandPlaceholder: "— ایالت (اختیاری) —",
    chooseAuthority: "به کدام اداره نیاز دارید؟",
    nationwideHelp: "خطوط ویژه سراسری",
    behoerdeFinden: "یافتن اداره",
    onMap: "نمایش روی نقشه",
    callPhone: "تماس",
    bundesweitTel: "115 — خط ویژه ادارات سراسری",
    writeLetter: "نوشتن نامه",
    closeAuthority: "اداره دیگر",
    backToCity: "← شهر دیگر",
    chooseCity: "لطفاً ابتدا شهر را وارد کنید!",
    online: "پورتال آنلاین",
    finder: "پورتال جستجو",
    address: "آدرس",
    phone: "تلفن",
    findOnMap: "📍 نمایش در Google Maps",
    writeBrief: "✍️ نوشتن نامه به این اداره",
    importantHint: "💡 مهم",
    hintText: "بهترین راه برای یافتن شماره‌های محلی، Google Maps است. پورتال‌های شهر معمولاً جدیدترین شماره‌ها را دارند!",
  },
};

// Behörden-Typen mit Übersetzungen
const BEHOERDEN = [
  {
    id: "jobcenter",
    icon: "💼",
    bg: "#FEF3C7",
    color: "#D97706",
    de: { name: "Jobcenter", desc: "Bürgergeld, Arbeitslosengeld" },
    en: { name: "Jobcenter", desc: "Unemployment benefit (Bürgergeld)" },
    ar: { name: "Jobcenter", desc: "إعانة بطالة (Bürgergeld)" },
    tr: { name: "Jobcenter", desc: "İşsizlik yardımı (Bürgergeld)" },
    fr: { name: "Jobcenter", desc: "Allocation chômage (Bürgergeld)" },
    es: { name: "Jobcenter", desc: "Subsidio de desempleo (Bürgergeld)" },
    ru: { name: "Jobcenter", desc: "Пособие по безработице (Bürgergeld)" },
    uk: { name: "Jobcenter", desc: "Допомога по безробіттю (Bürgergeld)" },
    fa: { name: "Jobcenter", desc: "کمک هزینه بیکاری (Bürgergeld)" },
    hotline: "0800 4 5555 00",
    finder: "https://web.arbeitsagentur.de/portal/metasuche/suche/dienststellen",
  },
  {
    id: "auslaender",
    icon: "🪪",
    bg: "#FEE2E2",
    color: "#DC2626",
    de: { name: "Ausländerbehörde", desc: "Aufenthaltstitel, Visum" },
    en: { name: "Immigration Office", desc: "Residence permit, visa" },
    ar: { name: "مكتب شؤون الأجانب", desc: "تصريح الإقامة والتأشيرة" },
    tr: { name: "Yabancılar Dairesi", desc: "Oturma izni, vize" },
    fr: { name: "Office des Étrangers", desc: "Titre de séjour, visa" },
    es: { name: "Oficina de Extranjería", desc: "Permiso de residencia, visa" },
    ru: { name: "Ведомство по делам иностранцев", desc: "Вид на жительство, виза" },
    uk: { name: "Управління у справах іноземців", desc: "Посвідка на проживання, віза" },
    fa: { name: "اداره امور خارجی‌ها", desc: "اقامت، ویزا" },
    hotline: "0228 99 615-0 (BAMF)",
    finder: "https://bamf-navi.bamf.de/",
  },
  {
    id: "buergeramt",
    icon: "🏠",
    bg: "#EDE9FE",
    color: "#7C3AED",
    de: { name: "Bürgeramt / Einwohnermeldeamt", desc: "Anmeldung, Ausweis" },
    en: { name: "Citizen's Office", desc: "Registration, ID card" },
    ar: { name: "مكتب المواطنين", desc: "التسجيل، بطاقة الهوية" },
    tr: { name: "Vatandaşlık Dairesi", desc: "Adres kaydı, kimlik" },
    fr: { name: "Bureau des citoyens", desc: "Enregistrement, carte d'identité" },
    es: { name: "Oficina del ciudadano", desc: "Registro, DNI" },
    ru: { name: "Бюро регистрации", desc: "Прописка, удостоверение" },
    uk: { name: "Бюро громадян", desc: "Реєстрація, посвідчення" },
    fa: { name: "اداره شهروندان", desc: "ثبت آدرس، کارت شناسایی" },
    hotline: "115",
    finder: "https://verwaltung.bund.de/leistungsverzeichnis/DE/leistungen/L100050",
  },
  {
    id: "finanzamt",
    icon: "📊",
    bg: "#DBEAFE",
    color: "#1D4ED8",
    de: { name: "Finanzamt", desc: "Steuern, Steuer-ID" },
    en: { name: "Tax Office", desc: "Taxes, tax ID" },
    ar: { name: "مكتب الضرائب", desc: "الضرائب، الرقم الضريبي" },
    tr: { name: "Vergi Dairesi", desc: "Vergiler, vergi numarası" },
    fr: { name: "Service des impôts", desc: "Impôts, numéro fiscal" },
    es: { name: "Hacienda", desc: "Impuestos, NIF" },
    ru: { name: "Налоговая", desc: "Налоги, ИНН" },
    uk: { name: "Податкова", desc: "Податки, ІПН" },
    fa: { name: "اداره مالیات", desc: "مالیات، کد مالیاتی" },
    hotline: "0800 1 0 1 1 0 1 1",
    finder: "https://www.bzst.de/DE/Service/Behoerdenwegweiser/Finanzamtsuche/finanzamtsuche_node.html",
  },
  {
    id: "familienkasse",
    icon: "👶",
    bg: "#FCE7F3",
    color: "#BE185D",
    de: { name: "Familienkasse", desc: "Kindergeld, Familienzuschlag" },
    en: { name: "Family Benefits Office", desc: "Child benefit (Kindergeld)" },
    ar: { name: "صندوق الأسرة", desc: "إعانة الأطفال (Kindergeld)" },
    tr: { name: "Aile Kasası", desc: "Çocuk parası (Kindergeld)" },
    fr: { name: "Caisse familiale", desc: "Allocation enfants (Kindergeld)" },
    es: { name: "Caja Familiar", desc: "Subsidio infantil (Kindergeld)" },
    ru: { name: "Семейная касса", desc: "Пособие на детей (Kindergeld)" },
    uk: { name: "Сімейна каса", desc: "Допомога на дітей (Kindergeld)" },
    fa: { name: "صندوق خانواده", desc: "کمک هزینه فرزند (Kindergeld)" },
    hotline: "0800 4 5555 30",
    finder: "https://web.arbeitsagentur.de/portal/metasuche/suche/dienststellen",
  },
  {
    id: "sozialamt",
    icon: "🤝",
    bg: "#FFEDD5",
    color: "#EA580C",
    de: { name: "Sozialamt", desc: "Sozialhilfe, Wohngeld" },
    en: { name: "Social Office", desc: "Social welfare, housing benefit" },
    ar: { name: "المكتب الاجتماعي", desc: "المساعدة الاجتماعية والسكن" },
    tr: { name: "Sosyal Daire", desc: "Sosyal yardım, kira yardımı" },
    fr: { name: "Service social", desc: "Aide sociale, allocation logement" },
    es: { name: "Servicios Sociales", desc: "Ayuda social, ayuda de alquiler" },
    ru: { name: "Социальная служба", desc: "Соцпомощь, пособие на жильё" },
    uk: { name: "Соціальна служба", desc: "Соцдопомога, допомога на житло" },
    fa: { name: "اداره خدمات اجتماعی", desc: "کمک اجتماعی، کمک هزینه مسکن" },
    hotline: "115",
    finder: "https://verwaltung.bund.de/",
  },
  {
    id: "integration",
    icon: "🎓",
    bg: "#DCFCE7",
    color: "#16A34A",
    de: { name: "Integrationskurs / VHS", desc: "Deutschkurs, Integration" },
    en: { name: "Integration Course / VHS", desc: "German course, integration" },
    ar: { name: "دورة الاندماج / VHS", desc: "دروس اللغة الألمانية والاندماج" },
    tr: { name: "Uyum Kursu / VHS", desc: "Almanca kursu, entegrasyon" },
    fr: { name: "Cours d'intégration / VHS", desc: "Cours d'allemand, intégration" },
    es: { name: "Curso de integración / VHS", desc: "Curso de alemán, integración" },
    ru: { name: "Интеграционный курс / VHS", desc: "Курс немецкого, интеграция" },
    uk: { name: "Інтеграційний курс / VHS", desc: "Курс німецької, інтеграція" },
    fa: { name: "دوره ادغام / VHS", desc: "کلاس آلمانی، ادغام" },
    hotline: "0911 943 6390 (BAMF)",
    finder: "https://bamf-navi.bamf.de/",
  },
];

const BUNDESLAENDER = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
  "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
  "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland",
  "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen",
];

export default function BundeslandDatenbank({ onSelectBehoerde, lang = "de" }) {
  const [stadt, setStadt] = useState("");
  const [bundesland, setBundesland] = useState("");
  const [selectedBeh, setSelectedBeh] = useState(null);

  const t = BL_TEXT[lang] || BL_TEXT.de;
  const isRTL = lang === "ar" || lang === "fa";

  function buildSearchURL(beh) {
    if (!stadt) return null;
    const query = `${beh[lang]?.name || beh.de.name} ${stadt}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  }

  function buildFinderURL(beh) {
    return beh.finder;
  }

  function handleWriteBrief(beh) {
    if (onSelectBehoerde) {
      onSelectBehoerde(
        { name: beh[lang]?.name || beh.de.name },
        stadt,
        bundesland
      );
    }
  }

  // Detail-Ansicht einer ausgewählten Behörde
  if (selectedBeh) {
    const behInfo = selectedBeh[lang] || selectedBeh.de;
    return (
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <button onClick={() => setSelectedBeh(null)}
          style={{background:"transparent",border:"none",color:"#475569",cursor:"pointer",fontSize:14,textAlign:"left",fontFamily:"inherit",fontWeight:500,padding:0}}>
          {t.closeAuthority}
        </button>

        <div style={{background:"white",borderRadius:18,padding:20,border:`1px solid #E2E8F0`,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
            <div style={{width:60,height:60,background:selectedBeh.bg,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>
              {selectedBeh.icon}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:18,fontWeight:700,color:"#0F172A",letterSpacing:"-0.01em"}}>{behInfo.name}</div>
              <div style={{fontSize:13,color:"#64748B",marginTop:2}}>{behInfo.desc}</div>
            </div>
          </div>

          {stadt && (
            <>
              <div style={{fontSize:12,color:"#64748B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>
                {t.address}
              </div>
              <div style={{fontSize:15,color:"#0F172A",marginBottom:14,fontWeight:500}}>
                📍 {behInfo.name} in {stadt}
              </div>

              <a href={buildSearchURL(selectedBeh)} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                  background:"#3B82F6",color:"white",borderRadius:12,padding:"14px 18px",
                  fontSize:15,fontWeight:600,textDecoration:"none",marginBottom:10,
                  boxShadow:"0 4px 14px rgba(59,130,246,0.35)"}}>
                {t.findOnMap}
              </a>
            </>
          )}

          <a href={buildFinderURL(selectedBeh)} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              background:"white",color:"#0F172A",borderRadius:12,padding:"13px 18px",
              fontSize:14,fontWeight:600,textDecoration:"none",border:`1.5px solid #E2E8F0`,marginBottom:10}}>
            🔍 {t.finder}
          </a>

          {selectedBeh.hotline && (
            <a href={`tel:${selectedBeh.hotline.replace(/\s/g,"")}`}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                background:"#10B981",color:"white",borderRadius:12,padding:"13px 18px",
                fontSize:14,fontWeight:600,textDecoration:"none",marginBottom:14,
                boxShadow:"0 4px 14px rgba(16,185,129,0.3)"}}>
              📞 {selectedBeh.hotline}
            </a>
          )}

          <button onClick={() => handleWriteBrief(selectedBeh)}
            style={{width:"100%",background:"#0F172A",color:"white",border:"none",borderRadius:12,
              padding:"14px 18px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
              boxShadow:"0 8px 24px rgba(15,23,42,0.18)"}}>
            {t.writeBrief}
          </button>
        </div>

        <div style={{background:"#FEF3C7",borderLeft:`4px solid #F59E0B`,borderRadius:12,padding:"14px 18px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#92400E",marginBottom:6}}>
            {t.importantHint}
          </div>
          <div style={{fontSize:13,color:"#78350F",lineHeight:1.5}}>
            {t.hintText}
          </div>
        </div>
      </div>
    );
  }

  // Hauptansicht
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14, direction: isRTL ? "rtl" : "ltr"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",borderRadius:20,padding:"32px 24px",color:"white",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,background:"radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(30px)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:42,marginBottom:12}}>📍</div>
          <div style={{fontSize:22,fontWeight:700,lineHeight:1.3,marginBottom:8,letterSpacing:"-0.02em"}}>{t.heroTitle}</div>
          <div style={{fontSize:14,opacity:0.9,lineHeight:1.5}}>{t.heroSub}</div>
        </div>
      </div>

      {/* Stadt-Eingabe */}
      <div style={{background:"white",borderRadius:18,padding:20,border:`1px solid #E2E8F0`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{fontSize:18,fontWeight:700,color:"#0F172A",letterSpacing:"-0.01em"}}>{t.cityLabel}</div>
          <span style={{fontSize:24}}>🏙️</span>
        </div>
        <input
          type="text"
          value={stadt}
          onChange={e => setStadt(e.target.value)}
          placeholder={t.cityPlaceholder}
          style={{width:"100%",background:"#FAFAF9",border:`2px solid ${stadt ? "#3B82F6" : "#E2E8F0"}`,borderRadius:12,padding:"14px 16px",fontSize:15,outline:"none",fontFamily:"inherit",color:"#0F172A",marginBottom:10,transition:"all 200ms"}}
        />
        <select value={bundesland} onChange={e => setBundesland(e.target.value)}
          style={{width:"100%",background:"#FAFAF9",border:`1.5px solid #E2E8F0`,borderRadius:12,padding:"12px 14px",fontSize:14,outline:"none",fontFamily:"inherit",color:bundesland ? "#0F172A" : "#94A3B8"}}>
          <option value="">— {t.bundeslandPlaceholder} —</option>
          {BUNDESLAENDER.map(bl => <option key={bl} value={bl}>{bl}</option>)}
        </select>
      </div>

      {/* Behörden-Auswahl */}
      <div style={{fontSize:18,fontWeight:700,color:"#0F172A",letterSpacing:"-0.01em",margin:"4px 0 -4px"}}>
        {t.chooseAuthority}
      </div>

      {!stadt && (
        <div style={{background:"#FEF2F2",borderLeft:`4px solid #EF4444`,borderRadius:10,padding:"12px 16px",fontSize:14,color:"#991B1B",fontWeight:600}}>
          ⚠️ {t.chooseCity}
        </div>
      )}

      {BEHOERDEN.map(beh => {
        const info = beh[lang] || beh.de;
        return (
          <button key={beh.id}
            onClick={() => stadt && setSelectedBeh(beh)}
            disabled={!stadt}
            style={{
              background:"white",border:`1px solid #E2E8F0`,borderRadius:14,
              padding:"14px 16px",cursor:stadt?"pointer":"not-allowed",
              display:"flex",alignItems:"center",gap:14,
              textAlign:isRTL?"right":"left",fontFamily:"inherit",
              opacity:stadt?1:0.5,transition:"all 200ms",
              boxShadow:"0 1px 2px rgba(0,0,0,0.03)"
            }}>
            <div style={{width:50,height:50,background:beh.bg,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
              {beh.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:"#0F172A",letterSpacing:"-0.01em",marginBottom:2}}>
                {info.name}
              </div>
              <div style={{fontSize:12,color:"#64748B",lineHeight:1.4}}>
                {info.desc}
              </div>
            </div>
            <div style={{fontSize:18,color:"#94A3B8"}}>{isRTL ? "‹" : "›"}</div>
          </button>
        );
      })}

      {/* Bundesweite Hotlines */}
      <div style={{background:"#F1F5F9",borderRadius:14,padding:"16px 18px",marginTop:8}}>
        <div style={{fontSize:13,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>
          📞 {t.nationwideHelp}
        </div>
        <a href="tel:115" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid #E2E8F0`,textDecoration:"none",color:"#0F172A"}}>
          <span style={{fontSize:18}}>🏛️</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600}}>115</div>
            <div style={{fontSize:11,color:"#64748B"}}>{t.bundesweitTel}</div>
          </div>
          <span style={{fontSize:14,color:"#3B82F6",fontWeight:600}}>📞</span>
        </a>
        <a href="tel:08004555500" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",textDecoration:"none",color:"#0F172A"}}>
          <span style={{fontSize:18}}>💼</span>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600}}>0800 4 5555 00</div>
            <div style={{fontSize:11,color:"#64748B"}}>Bundesagentur für Arbeit</div>
          </div>
          <span style={{fontSize:14,color:"#3B82F6",fontWeight:600}}>📞</span>
        </a>
      </div>
    </div>
  );
}
