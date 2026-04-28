import { useState, useRef, useCallback, useEffect } from "react";
import BundeslandDatenbank from "./BundeslandDatenbank";

// ── SPRACHEN ─────────────────────────────────────────────────────────────────
const LANGS = [
  { code:"de", label:"Deutsch",    flag:"🇩🇪", dir:"ltr" },
  { code:"en", label:"English",    flag:"🇬🇧", dir:"ltr" },
  { code:"ar", label:"عربي",       flag:"🇸🇦", dir:"rtl" },
  { code:"tr", label:"Türkçe",     flag:"🇹🇷", dir:"ltr" },
  { code:"uk", label:"Українська", flag:"🇺🇦", dir:"ltr" },
  { code:"ru", label:"Русский",    flag:"🇷🇺", dir:"ltr" },
  { code:"fa", label:"فارسی",      flag:"🇮🇷", dir:"rtl" },
  { code:"fr", label:"Français",   flag:"🇫🇷", dir:"ltr" },
  { code:"es", label:"Español",    flag:"🇪🇸", dir:"ltr" },
  { code:"vi", label:"Tiếng Việt", flag:"🇻🇳", dir:"ltr" },
];

// ── UI ÜBERSETZUNGEN ─────────────────────────────────────────────────────────
const UI = {
  ar:{appSub:"مساعد ذكاء اصطناعي للأجانب في ألمانيا",tab1:"مسح\nالرسالة",tab2:"المساعد",tab3:"استمارة",tab4:"جهات",footer:"محتوى ذكاء اصطناعي — راجع قبل الإرسال",scanTitle:"التقط صورة للرسالة",scanSub:"التقط صورة لرسالتك\nالذكاء الاصطناعي يقرأ ويشرح كل شيء",scanCamera:"فتح الكاميرا",scanGallery:"اختيار صورة",scanAnalyze:"حلل الآن",scanNew:"صورة جديدة",scanLoading:"جاري القراءة والترجمة...",transTitle:"الترجمة",explainTitle:"ماذا يعني هذا؟",stepsTitle:"ماذا تفعل الآن؟",replyBtn:"كتابة رسالة رد",replyLoading:"جاري الكتابة...",replyTitle:"رسالتك",copyBtn:"نسخ",copied:"تم النسخ",newScan:"رسالة جديدة",scanError:"خطأ! حاول صورة أوضح",urgHoch:"عاجل",urgMittel:"مهم",urgNiedrig:"عادي",chatHello:"مرحباً 👋\n\nأنا مساعدك للجهات الحكومية\n\nاختر أو اكتب",chatWhat:"ماذا تريد؟",chatBack:"رجوع",chatPlaceholder:"اكتب هنا...",chatError:"خطأ في الاتصال",chatLetter:"الرسالة الجاهزة:",
    quick:[{icon:"✍️",label:"رسالة رد",prompt:"لدي رسالة وأحتاج للرد"},{icon:"💶",label:"بيرغرغيلد",prompt:"أريد طلب Bürgergeld"},{icon:"⚖️",label:"اعتراض",prompt:"أريد تقديم اعتراض"},{icon:"👶",label:"كيندرغيلد",prompt:"أريد طلب Kindergeld"},{icon:"🪪",label:"إقامة",prompt:"تمديد الإقامة"},{icon:"📊",label:"ضرائب",prompt:"الإقرار الضريبي"}],
    formsTitle:"أي استمارة؟",formLoading:"جاري التحضير...",formCreating:"جاري الإنشاء...",formDone:"تم!",formAnother:"استمارة أخرى",formNext:"التالي",formCreate:"إنشاء",formSkip:"تخطي",formRequired:"إلزامي",formOptional:"اختياري",
    forms:[{id:"buergergeld",label:"طلب Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"تقديم اعتراض",icon:"⚖️",bg:"#FEE2E2",behoerde:"جهة حكومية"},{id:"kindergeld",label:"طلب Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"تسجيل السكن",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"تمديد الإقامة",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"الإقرار الضريبي",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  de:{appSub:"KI-Assistent für Ausländer in Deutschland",tab1:"Brief",tab2:"Chat",tab3:"Formular",tab4:"Behörden",footer:"KI-generiert — vor dem Absenden prüfen",scanTitle:"Brief fotografieren",scanSub:"Foto von Ihrem Brief machen\nDie KI liest und erklärt alles",scanCamera:"Kamera",scanGallery:"Galerie",scanAnalyze:"Analysieren",scanNew:"Neu",scanLoading:"Brief wird gelesen...",transTitle:"Übersetzung",explainTitle:"Was bedeutet das?",stepsTitle:"Was tun?",replyBtn:"Antwort schreiben",replyLoading:"Brief wird geschrieben...",replyTitle:"Ihr Antwortbrief",copyBtn:"Kopieren",copied:"Kopiert",newScan:"Neuer Brief",scanError:"Fehler! Deutlicheres Foto",urgHoch:"Dringend",urgMittel:"Wichtig",urgNiedrig:"Normal",chatHello:"Hallo 👋\n\nIch helfe mit deutschen Behörden\n\nWählen oder schreiben Sie",chatWhat:"Was möchten Sie?",chatBack:"Zurück",chatPlaceholder:"Hier schreiben...",chatError:"Verbindungsfehler",chatLetter:"Fertiger Brief:",
    quick:[{icon:"✍️",label:"Antwort\nschreiben",prompt:"Ich habe einen Brief und brauche eine Antwort"},{icon:"💶",label:"Bürgergeld\nbeantragen",prompt:"Ich möchte Bürgergeld beantragen"},{icon:"⚖️",label:"Widerspruch",prompt:"Widerspruch einlegen"},{icon:"👶",label:"Kindergeld",prompt:"Ich möchte Kindergeld beantragen"},{icon:"🪪",label:"Aufenthalts-\ntitel",prompt:"Aufenthaltstitel verlängern"},{icon:"📊",label:"Steuer-\nerklärung",prompt:"Steuererklärung machen"}],
    formsTitle:"Welches Formular?",formLoading:"Wird vorbereitet...",formCreating:"Wird erstellt...",formDone:"Fertig!",formAnother:"Anderes",formNext:"Weiter",formCreate:"Erstellen",formSkip:"Überspringen",formRequired:"Pflicht",formOptional:"Optional",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Widerspruch",icon:"⚖️",bg:"#FEE2E2",behoerde:"Behörde"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Anmeldung",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Aufenthaltstitel",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Steuererklärung",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  en:{appSub:"AI assistant for foreigners in Germany",tab1:"Letter",tab2:"Chat",tab3:"Form",tab4:"Authorities",footer:"AI-generated — verify before sending",scanTitle:"Photograph letter",scanSub:"Take a photo of your letter\nAI reads and explains everything",scanCamera:"Camera",scanGallery:"Gallery",scanAnalyze:"Analyze",scanNew:"New",scanLoading:"Reading letter...",transTitle:"Translation",explainTitle:"What does this mean?",stepsTitle:"Next steps",replyBtn:"Write reply",replyLoading:"Writing...",replyTitle:"Your reply",copyBtn:"Copy",copied:"Copied",newScan:"New letter",scanError:"Try clearer photo",urgHoch:"Urgent",urgMittel:"Important",urgNiedrig:"Normal",chatHello:"Hello 👋\n\nI help with German authorities\n\nChoose or write",chatWhat:"What do you need?",chatBack:"Back",chatPlaceholder:"Write here...",chatError:"Connection error",chatLetter:"Ready letter:",
    quick:[{icon:"✍️",label:"Write\nreply",prompt:"I received a letter and need to reply"},{icon:"💶",label:"Apply for\nBürgergeld",prompt:"Apply for Bürgergeld"},{icon:"⚖️",label:"File\nappeal",prompt:"File an appeal"},{icon:"👶",label:"Apply for\nKindergeld",prompt:"Apply for Kindergeld"},{icon:"🪪",label:"Residence\npermit",prompt:"Renew residence permit"},{icon:"📊",label:"Tax\nreturn",prompt:"File tax return"}],
    formsTitle:"Which form?",formLoading:"Preparing...",formCreating:"Creating...",formDone:"Done!",formAnother:"Another",formNext:"Next",formCreate:"Create",formSkip:"Skip",formRequired:"Required",formOptional:"Optional",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Appeal",icon:"⚖️",bg:"#FEE2E2",behoerde:"Authority"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Registration",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Permit",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Tax",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  tr:{appSub:"Almanya'daki yabancılar için yapay zeka",tab1:"Mektup",tab2:"Sohbet",tab3:"Form",tab4:"Daire",footer:"YZ — göndermeden önce kontrol",scanTitle:"Mektubu fotoğraflayın",scanSub:"Mektup fotoğrafı çekin\nYZ her şeyi okur",scanCamera:"Kamera",scanGallery:"Galeri",scanAnalyze:"Analiz et",scanNew:"Yeni",scanLoading:"Okunuyor...",transTitle:"Çeviri",explainTitle:"Bu ne anlama geliyor?",stepsTitle:"Şimdi ne?",replyBtn:"Cevap yaz",replyLoading:"Yazılıyor...",replyTitle:"Cevap",copyBtn:"Kopyala",copied:"Kopyalandı",newScan:"Yeni mektup",scanError:"Daha net fotoğraf",urgHoch:"Acil",urgMittel:"Önemli",urgNiedrig:"Normal",chatHello:"Merhaba 👋\n\nResmi kurumlar için yardımcınızım",chatWhat:"Ne istersiniz?",chatBack:"Geri",chatPlaceholder:"Buraya yazın...",chatError:"Bağlantı hatası",chatLetter:"Hazır mektup:",
    quick:[{icon:"✍️",label:"Cevap\nyaz",prompt:"Bir mektup aldım"},{icon:"💶",label:"Bürgergeld",prompt:"Bürgergeld başvurusu"},{icon:"⚖️",label:"İtiraz",prompt:"İtiraz et"},{icon:"👶",label:"Kindergeld",prompt:"Kindergeld başvurusu"},{icon:"🪪",label:"Oturma izni",prompt:"Oturma izni yenileme"},{icon:"📊",label:"Vergi",prompt:"Vergi beyannamesi"}],
    formsTitle:"Hangi form?",formLoading:"Hazırlanıyor...",formCreating:"Oluşturuluyor...",formDone:"Tamam!",formAnother:"Başka",formNext:"İleri",formCreate:"Oluştur",formSkip:"Atla",formRequired:"Zorunlu",formOptional:"İsteğe bağlı",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"İtiraz",icon:"⚖️",bg:"#FEE2E2",behoerde:"Kurum"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Adres kaydı",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Oturma izni",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Vergi",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
};
// Französisch
UI.fr = {appSub:"Assistant IA pour les étrangers en Allemagne",tab1:"Lettre",tab2:"Chat",tab3:"Formulaire",tab4:"Autorités",footer:"Généré par IA — vérifiez avant d'envoyer",scanTitle:"Photographier la lettre",scanSub:"Prenez une photo de votre lettre\nL'IA lit et explique tout",scanCamera:"Caméra",scanGallery:"Galerie",scanAnalyze:"Analyser",scanNew:"Nouveau",scanLoading:"Lecture en cours...",transTitle:"Traduction",explainTitle:"Que signifie ceci ?",stepsTitle:"Que faire ?",replyBtn:"Écrire une réponse",replyLoading:"Écriture...",replyTitle:"Votre réponse",copyBtn:"Copier",copied:"Copié",newScan:"Nouvelle lettre",scanError:"Erreur ! Photo plus claire",urgHoch:"Urgent",urgMittel:"Important",urgNiedrig:"Normal",chatHello:"Bonjour 👋\n\nJe vous aide avec les autorités allemandes\n\nChoisissez ou écrivez",chatWhat:"Que souhaitez-vous ?",chatBack:"Retour",chatPlaceholder:"Écrivez ici...",chatError:"Erreur de connexion",chatLetter:"Lettre prête :",
  quick:[{icon:"✍️",label:"Écrire\nréponse",prompt:"J'ai reçu une lettre et je dois répondre"},{icon:"💶",label:"Demander\nBürgergeld",prompt:"Je veux demander le Bürgergeld"},{icon:"⚖️",label:"Faire\nrecours",prompt:"Je veux faire un recours"},{icon:"👶",label:"Demander\nKindergeld",prompt:"Je veux demander le Kindergeld"},{icon:"🪪",label:"Permis\nde séjour",prompt:"Renouveler mon permis de séjour"},{icon:"📊",label:"Déclaration\nfiscale",prompt:"Faire ma déclaration fiscale"}],
  formsTitle:"Quel formulaire ?",formLoading:"Préparation...",formCreating:"Création...",formDone:"Terminé !",formAnother:"Autre formulaire",formNext:"Suivant",formCreate:"Créer",formSkip:"Passer",formRequired:"Obligatoire",formOptional:"Facultatif",
  forms:[{id:"buergergeld",label:"Demander Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Faire un recours",icon:"⚖️",bg:"#FEE2E2",behoerde:"Autorité"},{id:"kindergeld",label:"Demander Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Inscription domicile",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Permis de séjour",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Déclaration fiscale",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

// Spanisch
UI.es = {appSub:"Asistente IA para extranjeros en Alemania",tab1:"Carta",tab2:"Chat",tab3:"Formulario",tab4:"Autoridades",footer:"Generado por IA — verifique antes de enviar",scanTitle:"Fotografiar carta",scanSub:"Tome una foto de su carta\nLa IA lee y explica todo",scanCamera:"Cámara",scanGallery:"Galería",scanAnalyze:"Analizar",scanNew:"Nuevo",scanLoading:"Leyendo...",transTitle:"Traducción",explainTitle:"¿Qué significa?",stepsTitle:"¿Qué hacer?",replyBtn:"Escribir respuesta",replyLoading:"Escribiendo...",replyTitle:"Su respuesta",copyBtn:"Copiar",copied:"Copiado",newScan:"Nueva carta",scanError:"¡Error! Foto más clara",urgHoch:"Urgente",urgMittel:"Importante",urgNiedrig:"Normal",chatHello:"Hola 👋\n\nLe ayudo con las autoridades alemanas\n\nElija o escriba",chatWhat:"¿Qué necesita?",chatBack:"Atrás",chatPlaceholder:"Escriba aquí...",chatError:"Error de conexión",chatLetter:"Carta lista:",
  quick:[{icon:"✍️",label:"Escribir\nrespuesta",prompt:"Recibí una carta y necesito responder"},{icon:"💶",label:"Solicitar\nBürgergeld",prompt:"Quiero solicitar Bürgergeld"},{icon:"⚖️",label:"Presentar\nrecurso",prompt:"Quiero presentar un recurso"},{icon:"👶",label:"Solicitar\nKindergeld",prompt:"Quiero solicitar Kindergeld"},{icon:"🪪",label:"Permiso\nresidencia",prompt:"Renovar permiso de residencia"},{icon:"📊",label:"Declaración\nimpuestos",prompt:"Declaración de impuestos"}],
  formsTitle:"¿Qué formulario?",formLoading:"Preparando...",formCreating:"Creando...",formDone:"¡Listo!",formAnother:"Otro formulario",formNext:"Siguiente",formCreate:"Crear",formSkip:"Saltar",formRequired:"Obligatorio",formOptional:"Opcional",
  forms:[{id:"buergergeld",label:"Solicitar Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Presentar recurso",icon:"⚖️",bg:"#FEE2E2",behoerde:"Autoridad"},{id:"kindergeld",label:"Solicitar Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Registro domicilio",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Permiso residencia",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Impuestos",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

// Russisch
UI.ru = {appSub:"ИИ-помощник для иностранцев в Германии",tab1:"Письмо",tab2:"Чат",tab3:"Форма",tab4:"Органы",footer:"Сгенерировано ИИ — проверьте перед отправкой",scanTitle:"Сфотографируйте письмо",scanSub:"Сделайте фото письма\nИИ читает и объясняет",scanCamera:"Камера",scanGallery:"Галерея",scanAnalyze:"Анализ",scanNew:"Новое",scanLoading:"Читаю...",transTitle:"Перевод",explainTitle:"Что это значит?",stepsTitle:"Что делать?",replyBtn:"Написать ответ",replyLoading:"Пишу...",replyTitle:"Ваш ответ",copyBtn:"Копировать",copied:"Скопировано",newScan:"Новое письмо",scanError:"Ошибка! Чёткое фото",urgHoch:"Срочно",urgMittel:"Важно",urgNiedrig:"Обычно",chatHello:"Привет 👋\n\nЯ помогаю с немецкими органами\n\nВыберите или пишите",chatWhat:"Что нужно?",chatBack:"Назад",chatPlaceholder:"Пишите здесь...",chatError:"Ошибка соединения",chatLetter:"Готовое письмо:",
  quick:[{icon:"✍️",label:"Написать\nответ",prompt:"Я получил письмо и должен ответить"},{icon:"💶",label:"Подать\nBürgergeld",prompt:"Хочу подать Bürgergeld"},{icon:"⚖️",label:"Подать\nжалобу",prompt:"Хочу подать жалобу"},{icon:"👶",label:"Подать\nKindergeld",prompt:"Хочу подать Kindergeld"},{icon:"🪪",label:"Продлить\nВНЖ",prompt:"Продлить ВНЖ"},{icon:"📊",label:"Налоговая\nдекларация",prompt:"Налоговая декларация"}],
  formsTitle:"Какая форма?",formLoading:"Подготовка...",formCreating:"Создание...",formDone:"Готово!",formAnother:"Другая",formNext:"Далее",formCreate:"Создать",formSkip:"Пропустить",formRequired:"Обязательно",formOptional:"Необязательно",
  forms:[{id:"buergergeld",label:"Подать Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Подать жалобу",icon:"⚖️",bg:"#FEE2E2",behoerde:"Орган"},{id:"kindergeld",label:"Подать Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Регистрация",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"ВНЖ",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Налоги",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

// Ukrainisch
UI.uk = {appSub:"ШІ-помічник для іноземців у Німеччині",tab1:"Лист",tab2:"Чат",tab3:"Форма",tab4:"Органи",footer:"Згенеровано ШІ — перевірте перед надсиланням",scanTitle:"Сфотографуйте лист",scanSub:"Зробіть фото вашого листа\nШІ читає та пояснює",scanCamera:"Камера",scanGallery:"Галерея",scanAnalyze:"Аналізувати",scanNew:"Новий",scanLoading:"Читаю...",transTitle:"Переклад",explainTitle:"Що це означає?",stepsTitle:"Що робити?",replyBtn:"Написати відповідь",replyLoading:"Пишу...",replyTitle:"Ваша відповідь",copyBtn:"Копіювати",copied:"Скопійовано",newScan:"Новий лист",scanError:"Помилка! Чіткіше фото",urgHoch:"Терміново",urgMittel:"Важливо",urgNiedrig:"Звичайно",chatHello:"Привіт 👋\n\nДопомагаю з німецькими органами\n\nВиберіть або пишіть",chatWhat:"Що потрібно?",chatBack:"Назад",chatPlaceholder:"Пишіть тут...",chatError:"Помилка з'єднання",chatLetter:"Готовий лист:",
  quick:[{icon:"✍️",label:"Написати\nвідповідь",prompt:"Я отримав лист і маю відповісти"},{icon:"💶",label:"Подати\nBürgergeld",prompt:"Хочу подати Bürgergeld"},{icon:"⚖️",label:"Подати\nоскарження",prompt:"Хочу оскаржити"},{icon:"👶",label:"Подати\nKindergeld",prompt:"Хочу подати Kindergeld"},{icon:"🪪",label:"Продовжити\nдозвіл",prompt:"Продовжити дозвіл на проживання"},{icon:"📊",label:"Податкова\nдекларація",prompt:"Податкова декларація"}],
  formsTitle:"Яка форма?",formLoading:"Підготовка...",formCreating:"Створення...",formDone:"Готово!",formAnother:"Інша",formNext:"Далі",formCreate:"Створити",formSkip:"Пропустити",formRequired:"Обов'язково",formOptional:"Необов'язково",
  forms:[{id:"buergergeld",label:"Подати Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Подати оскарження",icon:"⚖️",bg:"#FEE2E2",behoerde:"Орган"},{id:"kindergeld",label:"Подати Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Реєстрація",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Дозвіл проживання",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Податки",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

// Persisch (Farsi)
UI.fa = {appSub:"دستیار هوش مصنوعی برای خارجی‌ها در آلمان",tab1:"نامه",tab2:"چت",tab3:"فرم",tab4:"ادارات",footer:"تولید شده توسط هوش مصنوعی — قبل از ارسال بررسی کنید",scanTitle:"از نامه عکس بگیرید",scanSub:"از نامه‌ خود عکس بگیرید\nهوش مصنوعی می‌خواند و توضیح می‌دهد",scanCamera:"دوربین",scanGallery:"گالری",scanAnalyze:"تحلیل کن",scanNew:"جدید",scanLoading:"در حال خواندن...",transTitle:"ترجمه",explainTitle:"این چه معنی دارد؟",stepsTitle:"چه باید کرد؟",replyBtn:"نوشتن پاسخ",replyLoading:"در حال نوشتن...",replyTitle:"پاسخ شما",copyBtn:"کپی",copied:"کپی شد",newScan:"نامه جدید",scanError:"خطا! عکس واضح‌تر",urgHoch:"فوری",urgMittel:"مهم",urgNiedrig:"عادی",chatHello:"سلام 👋\n\nمن به شما با ادارات آلمان کمک می‌کنم\n\nانتخاب کنید یا بنویسید",chatWhat:"چه می‌خواهید؟",chatBack:"بازگشت",chatPlaceholder:"اینجا بنویسید...",chatError:"خطای اتصال",chatLetter:"نامه آماده:",
  quick:[{icon:"✍️",label:"نوشتن\nپاسخ",prompt:"یک نامه دریافت کرده‌ام و باید پاسخ دهم"},{icon:"💶",label:"درخواست\nBürgergeld",prompt:"می‌خواهم Bürgergeld درخواست کنم"},{icon:"⚖️",label:"اعتراض",prompt:"می‌خواهم اعتراض کنم"},{icon:"👶",label:"درخواست\nKindergeld",prompt:"می‌خواهم Kindergeld درخواست کنم"},{icon:"🪪",label:"تمدید\nاقامت",prompt:"تمدید اقامت"},{icon:"📊",label:"اظهارنامه\nمالیاتی",prompt:"اظهارنامه مالیاتی"}],
  formsTitle:"کدام فرم؟",formLoading:"در حال آماده‌سازی...",formCreating:"در حال ایجاد...",formDone:"تمام!",formAnother:"فرم دیگر",formNext:"بعدی",formCreate:"ایجاد",formSkip:"رد کردن",formRequired:"اجباری",formOptional:"اختیاری",
  forms:[{id:"buergergeld",label:"درخواست Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"اعتراض",icon:"⚖️",bg:"#FEE2E2",behoerde:"اداره"},{id:"kindergeld",label:"درخواست Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"ثبت آدرس",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"اقامت",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"مالیات",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

// Vietnamesisch
UI.vi = {appSub:"Trợ lý AI cho người nước ngoài tại Đức",tab1:"Thư",tab2:"Chat",tab3:"Đơn",tab4:"Cơ quan",footer:"AI tạo — kiểm tra trước khi gửi",scanTitle:"Chụp ảnh thư",scanSub:"Chụp ảnh thư của bạn\nAI đọc và giải thích",scanCamera:"Máy ảnh",scanGallery:"Thư viện",scanAnalyze:"Phân tích",scanNew:"Mới",scanLoading:"Đang đọc...",transTitle:"Dịch",explainTitle:"Điều này có nghĩa gì?",stepsTitle:"Phải làm gì?",replyBtn:"Viết trả lời",replyLoading:"Đang viết...",replyTitle:"Trả lời",copyBtn:"Sao chép",copied:"Đã sao chép",newScan:"Thư mới",scanError:"Lỗi! Ảnh rõ hơn",urgHoch:"Khẩn cấp",urgMittel:"Quan trọng",urgNiedrig:"Bình thường",chatHello:"Xin chào 👋\n\nTôi giúp bạn với cơ quan Đức\n\nChọn hoặc viết",chatWhat:"Bạn cần gì?",chatBack:"Quay lại",chatPlaceholder:"Viết ở đây...",chatError:"Lỗi kết nối",chatLetter:"Thư đã sẵn sàng:",
  quick:[{icon:"✍️",label:"Viết\ntrả lời",prompt:"Tôi nhận được thư và cần trả lời"},{icon:"💶",label:"Xin\nBürgergeld",prompt:"Tôi muốn xin Bürgergeld"},{icon:"⚖️",label:"Khiếu\nnại",prompt:"Tôi muốn khiếu nại"},{icon:"👶",label:"Xin\nKindergeld",prompt:"Tôi muốn xin Kindergeld"},{icon:"🪪",label:"Gia hạn\ncư trú",prompt:"Gia hạn giấy phép cư trú"},{icon:"📊",label:"Khai\nthuế",prompt:"Khai thuế"}],
  formsTitle:"Đơn nào?",formLoading:"Đang chuẩn bị...",formCreating:"Đang tạo...",formDone:"Xong!",formAnother:"Đơn khác",formNext:"Tiếp",formCreate:"Tạo",formSkip:"Bỏ qua",formRequired:"Bắt buộc",formOptional:"Tùy chọn",
  forms:[{id:"buergergeld",label:"Xin Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Khiếu nại",icon:"⚖️",bg:"#FEE2E2",behoerde:"Cơ quan"},{id:"kindergeld",label:"Xin Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Đăng ký địa chỉ",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Cư trú",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Thuế",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]};

function getUI(lang){ return UI[lang] || UI.de; }
function getLang(code){ return LANGS.find(l=>l.code===code)||LANGS[0]; }

async function callClaude(messages, system, maxTokens=1200) {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages}),
  });
  if(!r.ok) throw new Error(`${r.status}`);
  const d = await r.json();
  return d.content?.map(c=>c.text||"").join("")||"";
}
function toB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});}
function mtype(f){return f.type==="image/png"?"image/png":f.type==="image/webp"?"image/webp":"image/jpeg";}

// ─── PREMIUM DESIGN TOKENS ───────────────────────────────────────────────────
const T = {
  // Backgrounds — moderne weiche Töne
  bg:        "#FAFAF9",
  bgSoft:    "#F5F5F4",
  surface:   "#FFFFFF",
  surfaceAlt:"#FAFAF9",

  // Brand colors — frisch und premium
  brand:     "#0F172A",   // dunkles Slate
  brandLight:"#1E293B",
  accent:    "#3B82F6",   // klares Blau
  accent2:   "#8B5CF6",   // Violett
  accent3:   "#EC4899",   // Pink für Highlights

  // Status
  success:   "#10B981",
  successL:  "#ECFDF5",
  warning:   "#F59E0B",
  warningL:  "#FFFBEB",
  danger:    "#EF4444",
  dangerL:   "#FEF2F2",

  // Text
  ink:       "#0F172A",
  inkSoft:   "#475569",
  inkMute:   "#94A3B8",

  // Borders
  border:    "#E2E8F0",
  borderL:   "#F1F5F9",
};

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────
function Btn({children, onClick, disabled, variant="primary", icon, style={}}) {
  const variants = {
    primary: { bg:T.brand, fg:"white", hoverBg:T.brandLight, shadow:"0 8px 24px rgba(15,23,42,0.18)" },
    accent:  { bg:T.accent, fg:"white", hoverBg:"#2563EB", shadow:"0 8px 24px rgba(59,130,246,0.35)" },
    ghost:   { bg:"transparent", fg:T.ink, hoverBg:T.borderL, shadow:"none", border:`1.5px solid ${T.border}` },
    soft:    { bg:T.borderL, fg:T.ink, hoverBg:"#E2E8F0", shadow:"none" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:"100%",padding:"18px 24px",
        background:disabled?"#E5E7EB":v.bg, color:disabled?"#9CA3AF":v.fg,
        border:v.border||"none", borderRadius:14,
        fontSize:16, fontWeight:600, letterSpacing:"-0.01em",
        cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit", boxShadow:disabled?"none":v.shadow,
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        transition:"all 200ms cubic-bezier(0.4,0,0.2,1)",
        ...style}}>
      {icon && <span style={{fontSize:20,lineHeight:1}}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({children, style={}, glow=false}) {
  return (
    <div style={{
      background:T.surface, borderRadius:20, padding:"22px 20px",
      border:`1px solid ${T.border}`,
      boxShadow: glow
        ? "0 1px 2px rgba(0,0,0,0.04), 0 8px 32px rgba(15,23,42,0.06)"
        : "0 1px 2px rgba(0,0,0,0.03)",
      ...style
    }}>{children}</div>
  );
}

function Spinner({text}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"40px 20px"}}>
      <div className="spinner" style={{
        width:44,height:44,
        border:`3px solid ${T.borderL}`,
        borderTopColor:T.accent,
        borderRadius:"50%",
        animation:"spin 0.8s linear infinite"
      }}/>
      <div style={{fontSize:14,color:T.inkSoft,fontWeight:500,textAlign:"center",letterSpacing:"-0.01em"}}>{text}</div>
    </div>
  );
}

function CopyBtn({u, text}) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}
      style={{
        background: ok?T.successL:T.surface,
        border:`1.5px solid ${ok?T.success:T.border}`,
        borderRadius:12, padding:"12px 16px",
        fontSize:14, fontWeight:600, letterSpacing:"-0.01em",
        color:ok?T.success:T.ink,
        cursor:"pointer", fontFamily:"inherit",
        display:"flex",alignItems:"center",gap:8,width:"100%",justifyContent:"center",
        transition:"all 200ms"
      }}>
      <span style={{fontSize:16}}>{ok?"✓":"⎘"}</span>
      {ok ? u.copied : u.copyBtn}
    </button>
  );
}

// Premium chip/badge
function Chip({label, color, bg}) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:6,
      background:bg, color,
      padding:"6px 12px", borderRadius:8,
      fontSize:12, fontWeight:600, letterSpacing:"-0.01em",
    }}>{label}</span>
  );
}

// ─── SCAN TAB — premium ─────────────────────────────────────────────────────
function ScanTab({lang}) {
  const ln = getLang(lang); const u = getUI(lang);
  const [img,setImg]=useState(null);const[mt,setMt]=useState("image/jpeg");
  const [prev,setPrev]=useState(null);const[res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);const[reply,setReply]=useState("");
  const [replyLoading,setReplyLoading]=useState(false);const[err,setErr]=useState("");
  const fileRef=useRef();const camRef=useRef();
  const handleFile=useCallback(async(file)=>{if(!file||!file.type.startsWith("image/")){setErr(u.scanError);return;}setErr("");setRes(null);setReply("");setPrev(URL.createObjectURL(file));setMt(mtype(file));setImg(await toB64(file));},[u]);
  async function analyze(){setLoading(true);setRes(null);setReply("");try{const raw=await callClaude([{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:img}},{type:"text",text:`Analysiere diesen deutschen Behördenbrief. NUR JSON ohne Backticks:\n{"behoerde":"...","betreff":"...","datum":"...","dringlichkeit":"hoch|mittel|niedrig","frist":"...oder null","uebersetzung":"Übersetzung auf ${ln.label}","erklaerung":"Erklärung auf ${ln.label}","schritte":["Schritt 1","Schritt 2"],"originaltext":"Text"}`}]}],"OCR. NUR JSON.",1500);setRes(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setErr(u.scanError);}setLoading(false);}
  async function genReply(){setReplyLoading(true);setReply("");const r=await callClaude([{role:"user",content:`Schreibe deutschen Antwortbrief.\nBehörde: ${res.behoerde}\nBetreff: ${res.betreff}\nDatum: ${new Date().toLocaleDateString("de-DE")}\nOriginaltext: ${res.originaltext}`}],`Behördenbrief-Experte. Vollständiger Brief auf Deutsch. Dann kurze Erklärung auf ${ln.label}.`,1200);setReply(r);setReplyLoading(false);}
  const reset=()=>{setPrev(null);setImg(null);setRes(null);setReply("");setErr("");};

  const urgentMap = {
    hoch:    { color:T.danger,  bg:T.dangerL,  label:u.urgHoch,    accent:"#FCA5A5" },
    mittel:  { color:T.warning, bg:T.warningL, label:u.urgMittel,  accent:"#FCD34D" },
    niedrig: { color:T.success, bg:T.successL, label:u.urgNiedrig, accent:"#86EFAC" },
  };
  const urg = urgentMap[res?.dringlichkeit] || urgentMap.mittel;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>

      {/* HERO — premium with gradient mesh */}
      {!prev && (
        <div style={{
          position:"relative",
          background:"linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)",
          borderRadius:24, padding:"48px 28px 36px",
          color:"white", textAlign:"center", overflow:"hidden",
        }}>
          {/* Gradient mesh decoration */}
          <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:"radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(40px)"}}/>
          <div style={{position:"absolute",bottom:-60,left:-30,width:180,height:180,background:"radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(40px)"}}/>

          <div style={{position:"relative",zIndex:1}}>
            <div style={{
              width:80,height:80,
              background:"linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter:"blur(20px)",
              borderRadius:24,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:40, margin:"0 auto 20px",
              border:"1px solid rgba(255,255,255,0.2)",
            }}>📄</div>
            <h2 style={{fontSize:28,fontWeight:700,letterSpacing:"-0.03em",marginBottom:10,direction:ln.dir}}>{u.scanTitle}</h2>
            <p style={{fontSize:15,opacity:0.7,lineHeight:1.6,direction:ln.dir,whiteSpace:"pre-line",maxWidth:320,margin:"0 auto"}}>{u.scanSub}</p>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:28}}>
              <button onClick={()=>camRef.current.click()} style={{
                background:"white", color:T.brand,
                border:"none", borderRadius:14, padding:"18px 24px",
                fontSize:16, fontWeight:600, letterSpacing:"-0.01em",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                boxShadow:"0 12px 32px rgba(0,0,0,0.25)",
              }}>
                <span style={{fontSize:20}}>📷</span>{u.scanCamera}
              </button>
              <button onClick={()=>fileRef.current.click()} style={{
                background:"rgba(255,255,255,0.1)", color:"white",
                border:"1px solid rgba(255,255,255,0.2)", borderRadius:14, padding:"18px 24px",
                fontSize:16, fontWeight:600, letterSpacing:"-0.01em",
                cursor:"pointer", fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                backdropFilter:"blur(10px)",
              }}>
                <span style={{fontSize:20}}>🖼️</span>{u.scanGallery}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {prev && !res && (
        <Card glow>
          <img src={prev} alt="Brief" style={{width:"100%",borderRadius:14,maxHeight:320,objectFit:"contain",background:T.borderL}}/>
          {err && <div style={{color:T.danger,fontSize:14,fontWeight:600,textAlign:"center",marginTop:14,padding:14,background:T.dangerL,borderRadius:12,direction:ln.dir}}>{err}</div>}
          {!loading && (
            <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
              <Btn icon="⚡" onClick={analyze} variant="accent">{u.scanAnalyze}</Btn>
              <Btn onClick={reset} variant="ghost">{u.scanNew}</Btn>
            </div>
          )}
          {loading && <Spinner text={u.scanLoading}/>}
        </Card>
      )}

      {/* RESULTS */}
      {res && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Behörden Header */}
          <Card glow>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:T.inkMute,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Absender</div>
                <div style={{fontSize:18,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>{res.behoerde}</div>
              </div>
              <Chip label={urg.label} color={urg.color} bg={urg.bg}/>
            </div>
            <div style={{fontSize:14,fontWeight:500,color:T.inkSoft,marginBottom:6,lineHeight:1.5}}>{res.betreff}</div>
            {res.datum && <div style={{fontSize:13,color:T.inkMute}}>📅 {res.datum}</div>}
            {res.frist && (
              <div style={{
                background:T.dangerL, border:`1.5px solid ${T.danger}`,
                borderRadius:12, padding:"12px 14px", marginTop:14,
                display:"flex",alignItems:"center",gap:10
              }}>
                <span style={{fontSize:18}}>⏰</span>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:T.danger,textTransform:"uppercase",letterSpacing:"0.06em"}}>Frist</div>
                  <div style={{fontSize:15,fontWeight:700,color:T.danger,marginTop:2}}>{res.frist}</div>
                </div>
              </div>
            )}
          </Card>

          {/* Übersetzung */}
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,background:"linear-gradient(135deg,#3B82F6,#1D4ED8)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>🌐</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:T.ink,letterSpacing:"-0.01em"}}>{u.transTitle}</div>
                <div style={{fontSize:12,color:T.inkMute}}>{ln.label}</div>
              </div>
            </div>
            <div style={{fontSize:15,color:T.ink,lineHeight:1.7,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left",whiteSpace:"pre-wrap"}}>{res.uebersetzung}</div>
          </Card>

          {/* Erklärung */}
          <Card>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,background:"linear-gradient(135deg,#10B981,#059669)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>💡</div>
              <div style={{fontSize:15,fontWeight:700,color:T.ink,letterSpacing:"-0.01em"}}>{u.explainTitle}</div>
            </div>
            <div style={{fontSize:15,color:T.ink,lineHeight:1.7,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left",whiteSpace:"pre-wrap"}}>{res.erklaerung}</div>
          </Card>

          {/* Steps */}
          {res.schritte?.length > 0 && (
            <Card>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:36,height:36,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>📋</div>
                <div style={{fontSize:15,fontWeight:700,color:T.ink,letterSpacing:"-0.01em"}}>{u.stepsTitle}</div>
              </div>
              {res.schritte.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14,paddingBottom:14,borderBottom:i<res.schritte.length-1?`1px solid ${T.borderL}`:"none"}}>
                  <div style={{
                    width:28,height:28,minWidth:28,
                    background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",
                    color:"white", borderRadius:8,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:13, fontWeight:700,
                  }}>{i+1}</div>
                  <div style={{fontSize:15,lineHeight:1.6,paddingTop:3,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left",color:T.ink}}>{s}</div>
                </div>
              ))}
            </Card>
          )}

          {!reply && !replyLoading && <Btn icon="✍️" onClick={genReply} variant="primary">{u.replyBtn}</Btn>}
          {replyLoading && <Card><Spinner text={u.replyLoading}/></Card>}

          {reply && (
            <Card style={{background:"linear-gradient(180deg,#FFFBEB,#FFFFFF)",border:`1px solid #FDE68A`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:36,height:36,background:"linear-gradient(135deg,#F59E0B,#D97706)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>✉️</div>
                <div style={{fontSize:15,fontWeight:700,color:T.ink,letterSpacing:"-0.01em"}}>{u.replyTitle}</div>
              </div>
              <div style={{
                background:"white", border:`1px solid ${T.border}`,
                borderRadius:12, padding:18,
                fontFamily:"'JetBrains Mono','SF Mono',monospace",
                fontSize:13, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:14,
                color:T.ink
              }}>{reply}</div>
              <CopyBtn u={u} text={reply}/>
            </Card>
          )}

          <Btn onClick={reset} variant="ghost" icon="↻">{u.newScan}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── CHAT TAB — premium ─────────────────────────────────────────────────────
function ChatTab({lang, prefilledContext}) {
  const ln = getLang(lang); const u = getUI(lang);
  const SYS = `Du bist ein geduldiger, freundlicher Helfer für Ausländer in Deutschland. Antworte auf ${ln.label} — kurze klare einfache Sätze. Briefe immer auf PERFEKTEM DEUTSCH.`;
  const initialMsg = prefilledContext
    ? {role:"assistant",content:prefilledContext.greeting,intro:true}
    : {role:"assistant",content:u.chatHello,intro:true};
  const [msgs,setMsgs]=useState([initialMsg]);
  const [input,setInput]=useState("");const[loading,setLoading]=useState(false);const[showQ,setShowQ]=useState(true);
  const bottomRef=useRef();
  function isLetter(t){return t.includes("Sehr geehrte")||t.includes("Mit freundlichen Grüßen");}
  async function send(text){const msg=text||input;if(!msg.trim()||loading)return;setInput("");setShowQ(false);const nm=[...msgs,{role:"user",content:msg}];setMsgs(nm);setLoading(true);try{const r=await callClaude(nm.filter(m=>!m.intro).map(m=>({role:m.role,content:m.content})),SYS,1400);setMsgs([...nm,{role:"assistant",content:r}]);}catch{setMsgs([...nm,{role:"assistant",content:u.chatError}]);}setLoading(false);setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);}

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Quick Actions */}
      {showQ && (
        <Card glow>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:16,letterSpacing:"-0.02em",direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left"}}>{u.chatWhat}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {u.quick.map(a => (
              <button key={a.label} onClick={()=>send(a.prompt)} style={{
                background:T.surfaceAlt, border:`1px solid ${T.border}`,
                borderRadius:14, padding:"16px 12px",
                cursor:"pointer", textAlign:"center", fontFamily:"inherit",
                transition:"all 200ms",
              }}>
                <div style={{fontSize:28,marginBottom:6}}>{a.icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.ink,letterSpacing:"-0.01em",lineHeight:1.3,whiteSpace:"pre",direction:ln.dir}}>{a.label}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Chat */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",flexDirection:"column",gap:14,maxHeight:440,overflowY:"auto",padding:18}}>
          {msgs.map((m,i) => {
            const hasLetter = m.role==="assistant" && isLetter(m.content);
            let expl = m.content, letter = "";
            if(hasLetter){
              const idx = m.content.indexOf("Sehr geehrte");
              if(idx>30){expl=m.content.slice(0,idx).trim();letter=m.content.slice(idx).trim();}
              else{expl="";letter=m.content;}
            }
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:6}}>
                {m.role==="assistant" && <span style={{fontSize:11,color:T.inkMute,fontWeight:600,marginLeft:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Assistant</span>}
                {(expl||!hasLetter) && (
                  <div style={{
                    maxWidth:"88%",
                    background: m.role==="user" ? T.brand : T.surfaceAlt,
                    color: m.role==="user" ? "white" : T.ink,
                    borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding:"14px 16px", fontSize:15, lineHeight:1.6,
                    whiteSpace:"pre-wrap", fontWeight:500,
                    direction:ln.dir,
                    textAlign: m.role==="user" && ln.dir==="rtl" ? "right":"left",
                    boxShadow: m.role==="user" ? "0 4px 16px rgba(15,23,42,0.15)" : "none",
                    letterSpacing:"-0.01em",
                  }}>{expl||m.content}</div>
                )}
                {hasLetter && letter && (
                  <div style={{width:"96%"}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.warning,marginBottom:8,letterSpacing:"0.06em",textTransform:"uppercase",direction:ln.dir}}>{u.chatLetter}</div>
                    <div style={{
                      background:T.warningL, border:`1.5px solid #FDE68A`,
                      borderRadius:14, padding:14,
                      fontFamily:"'JetBrains Mono','SF Mono',monospace",
                      fontSize:12, lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:10,
                      color:T.ink
                    }}>{letter}</div>
                    <CopyBtn u={u} text={letter}/>
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:6}}>
              <span style={{fontSize:11,color:T.inkMute,fontWeight:600,marginLeft:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Assistant</span>
              <div style={{background:T.surfaceAlt,borderRadius:"18px 18px 18px 4px",padding:"14px 18px",display:"flex",gap:6}}>
                {[0,.15,.3].map(d => <span key={d} style={{width:8,height:8,background:T.inkMute,borderRadius:"50%",display:"block",animation:`bounce 1.2s ${d}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{borderTop:`1px solid ${T.border}`,padding:14,display:"flex",gap:10,alignItems:"flex-end",background:T.surfaceAlt}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder={u.chatPlaceholder}
            style={{
              flex:1, background:"white",
              border:`1px solid ${T.border}`, borderRadius:12,
              color:T.ink, padding:"12px 14px",
              fontFamily:"inherit", fontSize:15,
              outline:"none", resize:"none", height:48,
              lineHeight:1.4, direction:ln.dir,
              transition:"border-color 200ms",
            }} dir={ln.dir}/>
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
            width:48, height:48,
            background: T.brand, color:"white",
            border:"none", borderRadius:12,
            fontSize:18, cursor:"pointer", flexShrink:0,
            opacity:loading||!input.trim()?.4:1,
            boxShadow:"0 4px 16px rgba(15,23,42,0.2)",
            transition:"all 200ms",
          }}>↑</button>
        </div>
      </Card>

      {!showQ && <Btn onClick={()=>setShowQ(true)} variant="ghost">{u.chatBack}</Btn>}
    </div>
  );
}

// ─── FORMS TAB — premium ────────────────────────────────────────────────────
function FormsTab({lang}) {
  const ln=getLang(lang);const u=getUI(lang);
  const[sel,setSel]=useState(null);const[qs,setQs]=useState([]);const[step,setStep]=useState(0);
  const[answers,setAnswers]=useState({});const[curAns,setCurAns]=useState("");const[result,setResult]=useState("");const[loading,setLoading]=useState(false);

  async function startForm(form){setSel(form);setStep(0);setAnswers({});setResult("");setQs([]);setLoading(true);
    try{const raw=await callClaude([{role:"user",content:`Formular: "${form.label}". Stelle 5 einfache Fragen auf ${ln.label}. NUR JSON Array:\n[{"id":"q0","frage":"Frage","beispiel":"Beispiel","pflicht":true}]`}],"Experte. NUR JSON.",600);setQs(JSON.parse(raw.replace(/```json|```/g,"").trim()));}
    catch{
      const fallback = {
        de:[{id:"q0",frage:"Ihr Name?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Adresse?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Geburtsdatum?",beispiel:"01.01.1990",pflicht:true}],
        en:[{id:"q0",frage:"Your name?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Address?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Date of birth?",beispiel:"01.01.1990",pflicht:true}],
        fr:[{id:"q0",frage:"Votre nom ?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Adresse ?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Date de naissance ?",beispiel:"01.01.1990",pflicht:true}],
        es:[{id:"q0",frage:"¿Su nombre?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"¿Dirección?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"¿Fecha de nacimiento?",beispiel:"01.01.1990",pflicht:true}],
        ar:[{id:"q0",frage:"اسمك الكامل؟",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"عنوانك؟",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"تاريخ الميلاد؟",beispiel:"01.01.1990",pflicht:true}],
        tr:[{id:"q0",frage:"Adınız?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Adresiniz?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Doğum tarihi?",beispiel:"01.01.1990",pflicht:true}],
        ru:[{id:"q0",frage:"Ваше имя?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Адрес?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Дата рождения?",beispiel:"01.01.1990",pflicht:true}],
        uk:[{id:"q0",frage:"Ваше ім'я?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Адреса?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Дата народження?",beispiel:"01.01.1990",pflicht:true}],
        fa:[{id:"q0",frage:"نام شما؟",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"آدرس؟",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"تاریخ تولد؟",beispiel:"01.01.1990",pflicht:true}],
        vi:[{id:"q0",frage:"Tên của bạn?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Địa chỉ?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Ngày sinh?",beispiel:"01.01.1990",pflicht:true}],
      };
      setQs(fallback[lang] || fallback.de);
    }
    setLoading(false);}
  async function nextStep(){const na={...answers,[qs[step].id]:curAns};setAnswers(na);setCurAns("");
    if(step+1>=qs.length){setLoading(true);const txt=qs.map(q=>`${q.frage}: ${na[q.id]||"—"}`).join("\n");const r=await callClaude([{role:"user",content:`Erstelle deutschen Antrag für "${sel.label}".\n\nAngaben:\n${txt}`}],"Experte. Formeller Brief auf Deutsch.",1500);setResult(r);setLoading(false);}else{setStep(step+1);}}

  if(!sel) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{fontSize:24,fontWeight:700,color:T.ink,letterSpacing:"-0.02em",direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left"}}>{u.formsTitle}</h2>
      {u.forms.map(f => (
        <button key={f.id} onClick={()=>startForm(f)} style={{
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:16, padding:"18px",
          cursor:"pointer", display:"flex", alignItems:"center", gap:14,
          textAlign:"left", fontFamily:"inherit",
          transition:"all 200ms",
          boxShadow:"0 1px 2px rgba(0,0,0,0.03)",
        }}>
          <div style={{
            width:52, height:52, background:f.bg, borderRadius:12,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, flexShrink:0,
          }}>{f.icon}</div>
          <div style={{flex:1,textAlign:ln.dir==="rtl"?"right":"left"}}>
            <div style={{fontSize:16,fontWeight:600,color:T.ink,letterSpacing:"-0.01em"}}>{f.label}</div>
            <div style={{fontSize:13,color:T.inkMute,marginTop:2}}>{f.behoerde}</div>
          </div>
          <div style={{fontSize:18,color:T.inkMute}}>{ln.dir==="rtl"?"‹":"›"}</div>
        </button>
      ))}
    </div>
  );

  if(result) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{
        background:"linear-gradient(135deg,#10B981,#059669)",
        borderRadius:18, padding:"28px 22px", color:"white", textAlign:"center",
      }}>
        <div style={{fontSize:44,marginBottom:8}}>✓</div>
        <div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em",direction:ln.dir}}>{sel.label}</div>
        <div style={{fontSize:14,opacity:0.9,marginTop:4,direction:ln.dir}}>{u.formDone}</div>
      </div>
      <Card>
        <div style={{
          background:T.surfaceAlt, borderRadius:12, padding:18,
          fontFamily:"'JetBrains Mono','SF Mono',monospace",
          fontSize:12, lineHeight:1.8, whiteSpace:"pre-wrap",
          color:T.ink, border:`1px solid ${T.border}`,
        }}>{result}</div>
      </Card>
      <CopyBtn u={u} text={result}/>
      <Btn onClick={()=>{setSel(null);setResult("");setStep(0);}} variant="ghost" icon="↻">{u.formAnother}</Btn>
    </div>
  );

  if(loading) return <Card><Spinner text={qs.length===0?u.formLoading:u.formCreating}/></Card>;
  if(qs.length===0) return <Card><Spinner text={u.formLoading}/></Card>;
  const q=qs[step]; const pct=Math.round((step/qs.length)*100);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <button onClick={()=>setSel(null)} style={{background:T.borderL,border:"none",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontSize:18,color:T.inkSoft}}>{ln.dir==="rtl"?"→":"←"}</button>
          <div style={{width:42,height:42,background:sel.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sel.icon}</div>
          <div style={{fontSize:16,fontWeight:600,color:T.ink,letterSpacing:"-0.01em",direction:ln.dir}}>{sel.label}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.inkSoft,fontWeight:500,marginBottom:8}}>
          <span>{step+1} / {qs.length}</span>
          <span style={{color:T.accent,fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{height:6,background:T.borderL,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.accent},${T.accent2})`,borderRadius:3,transition:"width 400ms"}}/>
        </div>
      </Card>

      <Card glow>
        <div style={{fontSize:11,fontWeight:600,color:q.pflicht?T.danger:T.inkMute,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left"}}>
          {q.pflicht?u.formRequired:u.formOptional}
        </div>
        <div style={{fontSize:22,fontWeight:700,color:T.ink,marginBottom:10,letterSpacing:"-0.02em",lineHeight:1.3,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left"}}>{q.frage}</div>
        {q.beispiel && <div style={{fontSize:14,color:T.inkMute,marginBottom:18,direction:ln.dir,textAlign:ln.dir==="rtl"?"right":"left"}}>z.B.: {q.beispiel}</div>}
        <textarea autoFocus value={curAns} onChange={e=>setCurAns(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();nextStep();}}}
          placeholder="..."
          style={{
            width:"100%", background:T.surfaceAlt,
            border:`1px solid ${T.border}`, borderRadius:12,
            color:T.ink, padding:"14px 16px",
            fontFamily:"inherit", fontSize:16,
            outline:"none", resize:"none", minHeight:90,
            lineHeight:1.5, direction:ln.dir,
            transition:"all 200ms",
          }} dir={ln.dir}/>
      </Card>

      <Btn onClick={nextStep} disabled={q.pflicht&&!curAns.trim()} icon={step+1>=qs.length?"✓":"→"} variant="primary">
        {step+1>=qs.length?u.formCreate:u.formNext}
      </Btn>
      {!q.pflicht && (
        <button onClick={()=>{setCurAns("");nextStep();}} style={{
          background:"none",border:"none",color:T.inkMute,cursor:"pointer",
          fontSize:14,textDecoration:"underline",fontFamily:"inherit",
        }}>{u.formSkip}</button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,setTab] = useState("scan");
  const [lang,setLang] = useState("de");
  const [showLP,setShowLP] = useState(false);
  const [chatContext,setChatContext] = useState(null);
  const ln = getLang(lang); const u = getUI(lang);

  function handleBehoerdeBrief(beh, stadt, bundesland) {
    setChatContext({
      greeting:`👋 Sie möchten an die ${beh.name} in ${stadt}${bundesland?`, ${bundesland}`:""} schreiben?\n\nWas ist Ihr Anliegen?`,
      behoerde:beh.name, stadt, bundesland,
    });
    setTab("chat");
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter Tight','Inter',-apple-system,sans-serif",maxWidth:520,margin:"0 auto",direction:ln.dir,position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        html,body,#root{height:100%;background:${T.bg};font-family:'Inter Tight','Inter',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.6}40%{transform:translateY(-6px);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input:focus,textarea:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px ${T.accent}22!important}
        button:active{transform:scale(0.97)}
        button:hover:not(:disabled){filter:brightness(1.05)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${T.inkMute}}
      `}</style>

      {/* HEADER — frosted glass effect */}
      <div style={{
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px) saturate(180%)",
        WebkitBackdropFilter:"blur(20px) saturate(180%)",
        borderBottom:`1px solid ${T.border}`,
        padding:"14px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{
            width:40, height:40,
            background:`linear-gradient(135deg, ${T.brand} 0%, #1E293B 100%)`,
            borderRadius:12,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:20, color:"white",
            boxShadow:"0 4px 12px rgba(15,23,42,0.25)",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.1),transparent 60%)"}}/>
            <span style={{position:"relative",zIndex:1}}>🇩🇪</span>
          </div>
          <div style={{textAlign:ln.dir==="rtl"?"right":"left"}}>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:"-0.025em",lineHeight:1.2}}>Behörden Assistent</div>
            <div style={{fontSize:11,color:T.inkMute,fontWeight:500,marginTop:1}}>{u.appSub}</div>
          </div>
        </div>

        {/* Lang Picker */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLP(!showLP)} style={{
            background:T.surface, border:`1px solid ${T.border}`,
            borderRadius:10, padding:"8px 12px",
            fontSize:14, fontWeight:600, color:T.ink,
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,
            fontFamily:"inherit",letterSpacing:"-0.01em",
          }}>
            {ln.flag} <span>{ln.label}</span> <span style={{fontSize:10,color:T.inkMute}}>▾</span>
          </button>
          {showLP && (
            <div style={{
              position:"absolute",
              right:ln.dir==="rtl"?"auto":0,
              left:ln.dir==="rtl"?0:"auto",
              top:"calc(100% + 6px)",
              background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:14, padding:6, zIndex:200, minWidth:180,
              boxShadow:"0 12px 40px rgba(0,0,0,0.12)",
              maxHeight:340, overflowY:"auto",
            }}>
              {LANGS.map(l => (
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLP(false);}} style={{
                  display:"flex",alignItems:"center",gap:10,width:"100%",
                  background:lang===l.code?T.borderL:"transparent",
                  border:"none",borderRadius:8,padding:"10px 12px",
                  color:T.ink, cursor:"pointer", fontSize:14,
                  fontFamily:"inherit", fontWeight:lang===l.code?700:500,
                  letterSpacing:"-0.01em",
                }}>
                  <span style={{fontSize:18}}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABS — pill style */}
      <div style={{
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px) saturate(180%)",
        WebkitBackdropFilter:"blur(20px) saturate(180%)",
        padding:"10px 14px 12px",
        display:"flex",gap:6,
        position:"sticky",top:69,zIndex:90,
        borderBottom:`1px solid ${T.border}`,
      }}>
        {[
          {id:"scan",icon:"📷",label:u.tab1},
          {id:"chat",icon:"✨",label:u.tab2},
          {id:"forms",icon:"📋",label:u.tab3},
          {id:"laender",icon:"📍",label:u.tab4},
        ].map(t => (
          <button key={t.id} onClick={()=>{setTab(t.id);if(t.id!=="chat")setChatContext(null);}} style={{
            flex:1,
            background: tab===t.id ? T.brand : T.surface,
            border: tab===t.id ? "none" : `1px solid ${T.border}`,
            borderRadius:11,
            padding:"10px 4px",
            cursor:"pointer", fontSize:11,
            fontWeight:tab===t.id?700:600,
            color: tab===t.id ? "white" : T.inkSoft,
            display:"flex",flexDirection:"column",alignItems:"center",gap:4,
            fontFamily:"inherit",
            transition:"all 200ms cubic-bezier(0.4,0,0.2,1)",
            letterSpacing:"-0.01em",
            boxShadow: tab===t.id ? "0 4px 14px rgba(15,23,42,0.22)" : "none",
          }}>
            <span style={{fontSize:18}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding:"16px 14px 90px",animation:"fadeIn 300ms ease-out"}}>
        {tab==="scan"   && <ScanTab  lang={lang}/>}
        {tab==="chat"   && <ChatTab  lang={lang} prefilledContext={chatContext}/>}
        {tab==="forms"  && <FormsTab lang={lang}/>}
        {tab==="laender"&& <BundeslandDatenbank onSelectBehoerde={handleBehoerdeBrief}/>}
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign:"center", padding:"12px 14px",
        color:T.inkMute, fontSize:11, fontWeight:500,
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px)",
        borderTop:`1px solid ${T.border}`,
        position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:520,direction:ln.dir,
        letterSpacing:"-0.01em",
      }}>
        {u.footer}
      </div>
    </div>
  );
}
