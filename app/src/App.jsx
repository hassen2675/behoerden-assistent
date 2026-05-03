import { useState, useRef, useCallback } from "react";
import BundeslandDatenbank from "./BundeslandDatenbank";

const LANGS = [
  { code:"de", label:"Deutsch", flag:"🇩🇪", dir:"ltr" },
  { code:"en", label:"English", flag:"🇬🇧", dir:"ltr" },
  { code:"ar", label:"عربي", flag:"🇸🇦", dir:"rtl" },
  { code:"tr", label:"Türkçe", flag:"🇹🇷", dir:"ltr" },
  { code:"uk", label:"Українська", flag:"🇺🇦", dir:"ltr" },
  { code:"ru", label:"Русский", flag:"🇷🇺", dir:"ltr" },
  { code:"fa", label:"فارسی", flag:"🇮🇷", dir:"rtl" },
  { code:"fr", label:"Français", flag:"🇫🇷", dir:"ltr" },
  { code:"es", label:"Español", flag:"🇪🇸", dir:"ltr" },
];

const UI = {
  de:{appSub:"KI-Assistent für Ausländer in Deutschland",tab1:"Brief",tab2:"Chat",tab3:"Formular",tab4:"Behörden",footer:"KI-generiert — vor dem Absenden prüfen",scanTitle:"Brief fotografieren",scanSub:"Foto von Ihrem Brief machen\nDie KI liest und erklärt alles",scanCamera:"Kamera",scanGallery:"Galerie",scanAnalyze:"Analysieren",scanNew:"Neu",scanLoading:"Brief wird gelesen...",transTitle:"Übersetzung",explainTitle:"Was bedeutet das?",stepsTitle:"Was tun?",replyBtn:"Antwort schreiben",replyLoading:"Brief wird geschrieben...",replyTitle:"Ihr Antwortbrief",copyBtn:"Kopieren",copied:"Kopiert",newScan:"Neuer Brief",scanError:"Fehler! Deutlicheres Foto",urgHoch:"Dringend",urgMittel:"Wichtig",urgNiedrig:"Normal",chatHello:"Hallo 👋\n\nIch helfe mit deutschen Behörden\n\nWählen oder schreiben Sie",chatWhat:"Was möchten Sie?",chatBack:"Zurück",chatPlaceholder:"Hier schreiben...",chatError:"Verbindungsfehler",chatLetter:"Fertiger Brief:",
    quick:[{icon:"✍️",label:"Antwort\nschreiben",prompt:"Ich habe einen Brief und brauche eine Antwort"},{icon:"💶",label:"Bürgergeld\nbeantragen",prompt:"Ich möchte Bürgergeld beantragen"},{icon:"⚖️",label:"Widerspruch",prompt:"Widerspruch einlegen"},{icon:"👶",label:"Kindergeld",prompt:"Ich möchte Kindergeld beantragen"},{icon:"🪪",label:"Aufenthalts-\ntitel",prompt:"Aufenthaltstitel verlängern"},{icon:"📊",label:"Steuer-\nerklärung",prompt:"Steuererklärung machen"}],
    formsTitle:"Welches Formular?",formLoading:"Wird vorbereitet...",formCreating:"Wird erstellt...",formDone:"Fertig!",formAnother:"Anderes",formNext:"Weiter",formCreate:"Erstellen",formSkip:"Überspringen",formRequired:"Pflicht",formOptional:"Optional",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Widerspruch",icon:"⚖️",bg:"#FEE2E2",behoerde:"Behörde"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Anmeldung",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Aufenthaltstitel",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Steuererklärung",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  en:{appSub:"AI assistant for foreigners in Germany",tab1:"Letter",tab2:"Chat",tab3:"Form",tab4:"Authorities",footer:"AI-generated — verify before sending",scanTitle:"Photograph letter",scanSub:"Take a photo of your letter\nAI reads and explains everything",scanCamera:"Camera",scanGallery:"Gallery",scanAnalyze:"Analyze",scanNew:"New",scanLoading:"Reading letter...",transTitle:"Translation",explainTitle:"What does this mean?",stepsTitle:"Next steps",replyBtn:"Write reply",replyLoading:"Writing...",replyTitle:"Your reply",copyBtn:"Copy",copied:"Copied",newScan:"New letter",scanError:"Try clearer photo",urgHoch:"Urgent",urgMittel:"Important",urgNiedrig:"Normal",chatHello:"Hello 👋\n\nI help with German authorities\n\nChoose or write",chatWhat:"What do you need?",chatBack:"Back",chatPlaceholder:"Write here...",chatError:"Connection error",chatLetter:"Ready letter:",
    quick:[{icon:"✍️",label:"Write\nreply",prompt:"I received a letter and need to reply"},{icon:"💶",label:"Apply for\nBürgergeld",prompt:"Apply for Bürgergeld"},{icon:"⚖️",label:"File\nappeal",prompt:"File an appeal"},{icon:"👶",label:"Apply for\nKindergeld",prompt:"Apply for Kindergeld"},{icon:"🪪",label:"Residence\npermit",prompt:"Renew residence permit"},{icon:"📊",label:"Tax\nreturn",prompt:"File tax return"}],
    formsTitle:"Which form?",formLoading:"Preparing...",formCreating:"Creating...",formDone:"Done!",formAnother:"Another",formNext:"Next",formCreate:"Create",formSkip:"Skip",formRequired:"Required",formOptional:"Optional",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"Appeal",icon:"⚖️",bg:"#FEE2E2",behoerde:"Authority"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Registration",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Permit",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Tax",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  ar:{appSub:"مساعد ذكاء اصطناعي للأجانب في ألمانيا",tab1:"مسح",tab2:"المساعد",tab3:"استمارة",tab4:"جهات",footer:"محتوى ذكاء اصطناعي — راجع قبل الإرسال",scanTitle:"التقط صورة للرسالة",scanSub:"التقط صورة لرسالتك\nالذكاء الاصطناعي يقرأ ويشرح كل شيء",scanCamera:"الكاميرا",scanGallery:"المعرض",scanAnalyze:"حلل الآن",scanNew:"جديد",scanLoading:"جاري القراءة والترجمة...",transTitle:"الترجمة",explainTitle:"ماذا يعني هذا؟",stepsTitle:"ماذا تفعل الآن؟",replyBtn:"كتابة رسالة رد",replyLoading:"جاري الكتابة...",replyTitle:"رسالتك",copyBtn:"نسخ",copied:"تم النسخ",newScan:"رسالة جديدة",scanError:"خطأ! حاول صورة أوضح",urgHoch:"عاجل",urgMittel:"مهم",urgNiedrig:"عادي",chatHello:"مرحباً 👋\n\nأنا مساعدك للجهات الحكومية\n\nاختر أو اكتب",chatWhat:"ماذا تريد؟",chatBack:"رجوع",chatPlaceholder:"اكتب هنا...",chatError:"خطأ في الاتصال",chatLetter:"الرسالة الجاهزة:",
    quick:[{icon:"✍️",label:"رسالة رد",prompt:"لدي رسالة وأحتاج للرد"},{icon:"💶",label:"بيرغرغيلد",prompt:"أريد طلب Bürgergeld"},{icon:"⚖️",label:"اعتراض",prompt:"أريد تقديم اعتراض"},{icon:"👶",label:"كيندرغيلد",prompt:"أريد طلب Kindergeld"},{icon:"🪪",label:"إقامة",prompt:"تمديد الإقامة"},{icon:"📊",label:"ضرائب",prompt:"الإقرار الضريبي"}],
    formsTitle:"أي استمارة؟",formLoading:"جاري التحضير...",formCreating:"جاري الإنشاء...",formDone:"تم!",formAnother:"استمارة أخرى",formNext:"التالي",formCreate:"إنشاء",formSkip:"تخطي",formRequired:"إلزامي",formOptional:"اختياري",
    forms:[{id:"buergergeld",label:"طلب Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"تقديم اعتراض",icon:"⚖️",bg:"#FEE2E2",behoerde:"جهة حكومية"},{id:"kindergeld",label:"طلب Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"تسجيل السكن",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"تمديد الإقامة",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"الإقرار الضريبي",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
  tr:{appSub:"Almanya'daki yabancılar için yapay zeka",tab1:"Mektup",tab2:"Sohbet",tab3:"Form",tab4:"Daire",footer:"YZ — göndermeden önce kontrol",scanTitle:"Mektubu fotoğraflayın",scanSub:"Mektup fotoğrafı çekin\nYZ her şeyi okur",scanCamera:"Kamera",scanGallery:"Galeri",scanAnalyze:"Analiz et",scanNew:"Yeni",scanLoading:"Okunuyor...",transTitle:"Çeviri",explainTitle:"Bu ne anlama geliyor?",stepsTitle:"Şimdi ne?",replyBtn:"Cevap yaz",replyLoading:"Yazılıyor...",replyTitle:"Cevap",copyBtn:"Kopyala",copied:"Kopyalandı",newScan:"Yeni mektup",scanError:"Daha net fotoğraf",urgHoch:"Acil",urgMittel:"Önemli",urgNiedrig:"Normal",chatHello:"Merhaba 👋\n\nResmi kurumlar için yardımcınızım",chatWhat:"Ne istersiniz?",chatBack:"Geri",chatPlaceholder:"Buraya yazın...",chatError:"Bağlantı hatası",chatLetter:"Hazır mektup:",
    quick:[{icon:"✍️",label:"Cevap\nyaz",prompt:"Bir mektup aldım"},{icon:"💶",label:"Bürgergeld",prompt:"Bürgergeld başvurusu"},{icon:"⚖️",label:"İtiraz",prompt:"İtiraz et"},{icon:"👶",label:"Kindergeld",prompt:"Kindergeld başvurusu"},{icon:"🪪",label:"Oturma izni",prompt:"Oturma izni yenileme"},{icon:"📊",label:"Vergi",prompt:"Vergi beyannamesi"}],
    formsTitle:"Hangi form?",formLoading:"Hazırlanıyor...",formCreating:"Oluşturuluyor...",formDone:"Tamam!",formAnother:"Başka",formNext:"İleri",formCreate:"Oluştur",formSkip:"Atla",formRequired:"Zorunlu",formOptional:"İsteğe bağlı",
    forms:[{id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7",behoerde:"Jobcenter"},{id:"widerspruch",label:"İtiraz",icon:"⚖️",bg:"#FEE2E2",behoerde:"Kurum"},{id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},{id:"anmeldung",label:"Adres kaydı",icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},{id:"aufenthalt",label:"Oturma izni",icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},{id:"steuer",label:"Vergi",icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"}]},
};
["uk","ru","fa","fr","es"].forEach(c => { if(!UI[c]) UI[c] = UI.en; });

function getUI(lang){ return UI[lang] || UI.de; }
function getLang(code){ return LANGS.find(l=>l.code===code)||LANGS[0]; }

async function callClaude(messages, system, maxTokens=1200, model="claude-sonnet-4-5") {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model,max_tokens:maxTokens,system,messages}),
  });
  if(!r.ok) throw new Error(`${r.status}`);
  const d = await r.json();
  return d.content?.map(c=>c.text||"").join("")||"";
}
function toB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});}
function mtype(f){return f.type==="image/png"?"image/png":f.type==="image/webp"?"image/webp":"image/jpeg";}

const T = {
  bg: "#FAFAF9", bgSoft: "#F5F5F4", surface: "#FFFFFF", surfaceAlt: "#FAFAF9",
  brand: "#0F172A", brandLight: "#1E293B",
  accent: "#3B82F6", accent2: "#8B5CF6",
  success: "#10B981", successL: "#ECFDF5",
  warning: "#F59E0B", warningL: "#FFFBEB",
  danger: "#EF4444", dangerL: "#FEF2F2",
  ink: "#0F172A", inkSoft: "#475569", inkMute: "#94A3B8",
  border: "#E2E8F0", borderL: "#F1F5F9",
};

function Btn({children, onClick, disabled, variant="primary", icon, style={}}) {
  const variants = {
    primary: { bg:T.brand, fg:"white", shadow:"0 8px 24px rgba(15,23,42,0.18)" },
    accent:  { bg:T.accent, fg:"white", shadow:"0 8px 24px rgba(59,130,246,0.35)" },
    ghost:   { bg:"transparent", fg:T.ink, shadow:"none", border:`1.5px solid ${T.border}` },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:"100%",padding:"18px 24px",
        background:disabled?"#E5E7EB":v.bg, color:disabled?"#9CA3AF":v.fg,
        border:v.border||"none", borderRadius:14,
        fontSize:16, fontWeight:600,
        cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit", boxShadow:disabled?"none":v.shadow,
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        transition:"all 200ms",
        ...style}}>
      {icon && <span style={{fontSize:20}}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({children, style={}}) {
  return (
    <div style={{
      background:T.surface, borderRadius:20, padding:"22px 20px",
      border:`1px solid ${T.border}`,
      boxShadow:"0 1px 2px rgba(0,0,0,0.03)",
      ...style
    }}>{children}</div>
  );
}

function Spinner({text}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"40px 20px"}}>
      <div style={{width:44,height:44,border:`3px solid ${T.borderL}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{fontSize:14,color:T.inkSoft,fontWeight:500}}>{text}</div>
    </div>
  );
}

function CopyBtn({u, text}) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}
      style={{background:ok?T.successL:T.surface,border:`1.5px solid ${ok?T.success:T.border}`,borderRadius:12,padding:"12px 16px",fontSize:14,fontWeight:600,color:ok?T.success:T.ink,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,width:"100%",justifyContent:"center"}}>
      <span style={{fontSize:16}}>{ok?"✓":"⎘"}</span>{ok?u.copied:u.copyBtn}
    </button>
  );
}

function Chip({label, color, bg}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,background:bg,color,padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600}}>{label}</span>;
}

function ScanTab({lang}) {
  const ln = getLang(lang); const u = getUI(lang);
  const [img,setImg]=useState(null);const[mt,setMt]=useState("image/jpeg");
  const [prev,setPrev]=useState(null);const[res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);const[reply,setReply]=useState("");
  const [replyLoading,setReplyLoading]=useState(false);const[err,setErr]=useState("");
  const fileRef=useRef();const camRef=useRef();
  const handleFile=useCallback(async(file)=>{if(!file||!file.type.startsWith("image/")){setErr(u.scanError);return;}setErr("");setRes(null);setReply("");setPrev(URL.createObjectURL(file));setMt(mtype(file));setImg(await toB64(file));},[u]);
  async function analyze(){setLoading(true);setRes(null);setReply("");try{const raw=await callClaude([{role:"user",content:[{type:"image",source:{type:"base64",media_type:mt,data:img}},{type:"text",text:`Analysiere diesen deutschen Behördenbrief. NUR JSON ohne Backticks:\n{"behoerde":"...","betreff":"...","datum":"...","dringlichkeit":"hoch|mittel|niedrig","frist":"...oder null","uebersetzung":"Übersetzung auf ${ln.label}","erklaerung":"Erklärung auf ${ln.label}","schritte":["Schritt 1","Schritt 2"],"originaltext":"Text"}`}]}],"OCR. NUR JSON.",1500);setRes(JSON.parse(raw.replace(/```json|```/g,"").trim()));}catch{setErr(u.scanError);}setLoading(false);}
  async function genReply(){setReplyLoading(true);setReply("");try{const r=await callClaude([{role:"user",content:`Schreibe deutschen Antwortbrief.\nBehörde: ${res.behoerde}\nBetreff: ${res.betreff}\nOriginaltext: ${res.originaltext}`}],`Behördenbrief-Experte. Vollständiger Brief auf Deutsch.`,1200);setReply(r);}catch(e){setReply("Fehler: "+e.message);}setReplyLoading(false);}
  const reset=()=>{setPrev(null);setImg(null);setRes(null);setReply("");setErr("");};

  const urgentMap = {
    hoch:    { color:T.danger, bg:T.dangerL, label:u.urgHoch },
    mittel:  { color:T.warning, bg:T.warningL, label:u.urgMittel },
    niedrig: { color:T.success, bg:T.successL, label:u.urgNiedrig },
  };
  const urg = urgentMap[res?.dringlichkeit] || urgentMap.mittel;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>

      {!prev && (
        <div style={{position:"relative",background:"linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)",borderRadius:24,padding:"48px 28px 36px",color:"white",textAlign:"center",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:"radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(40px)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{width:80,height:80,background:"linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 20px",border:"1px solid rgba(255,255,255,0.2)"}}>📄</div>
            <h2 style={{fontSize:28,fontWeight:700,marginBottom:10,direction:ln.dir}}>{u.scanTitle}</h2>
            <p style={{fontSize:15,opacity:0.7,lineHeight:1.6,direction:ln.dir,whiteSpace:"pre-line",maxWidth:320,margin:"0 auto"}}>{u.scanSub}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:28}}>
              <button onClick={()=>camRef.current.click()} style={{background:"white",color:T.brand,border:"none",borderRadius:14,padding:"18px 24px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 12px 32px rgba(0,0,0,0.25)"}}>
                <span style={{fontSize:20}}>📷</span>{u.scanCamera}
              </button>
              <button onClick={()=>fileRef.current.click()} style={{background:"rgba(255,255,255,0.1)",color:"white",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,padding:"18px 24px",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                <span style={{fontSize:20}}>🖼️</span>{u.scanGallery}
              </button>
            </div>
          </div>
        </div>
      )}

      {prev && !res && (
        <Card>
          <img src={prev} alt="Brief" style={{width:"100%",borderRadius:14,maxHeight:320,objectFit:"contain",background:T.borderL}}/>
          {err && <div style={{color:T.danger,fontSize:14,fontWeight:600,textAlign:"center",marginTop:14,padding:14,background:T.dangerL,borderRadius:12}}>{err}</div>}
          {!loading && (
            <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
              <Btn icon="⚡" onClick={analyze} variant="accent">{u.scanAnalyze}</Btn>
              <Btn onClick={reset} variant="ghost">{u.scanNew}</Btn>
            </div>
          )}
          {loading && <Spinner text={u.scanLoading}/>}
        </Card>
      )}

      {res && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:T.inkMute,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Absender</div>
                <div style={{fontSize:18,fontWeight:700,color:T.ink}}>{res.behoerde}</div>
              </div>
              <Chip label={urg.label} color={urg.color} bg={urg.bg}/>
            </div>
            <div style={{fontSize:14,fontWeight:500,color:T.inkSoft,marginBottom:6,lineHeight:1.5}}>{res.betreff}</div>
            {res.datum && <div style={{fontSize:13,color:T.inkMute}}>📅 {res.datum}</div>}
            {res.frist && <div style={{background:T.dangerL,border:`1.5px solid ${T.danger}`,borderRadius:12,padding:"12px 14px",marginTop:14}}>⏰ {res.frist}</div>}
          </Card>

          <Card>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,background:"linear-gradient(135deg,#3B82F6,#1D4ED8)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>🌐</div>
              <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{u.transTitle}</div>
            </div>
            <div style={{fontSize:15,color:T.ink,lineHeight:1.7,direction:ln.dir,whiteSpace:"pre-wrap"}}>{res.uebersetzung}</div>
          </Card>

          <Card>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,background:"linear-gradient(135deg,#10B981,#059669)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>💡</div>
              <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{u.explainTitle}</div>
            </div>
            <div style={{fontSize:15,color:T.ink,lineHeight:1.7,direction:ln.dir,whiteSpace:"pre-wrap"}}>{res.erklaerung}</div>
          </Card>

          {res.schritte?.length > 0 && (
            <Card>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:36,height:36,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white"}}>📋</div>
                <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{u.stepsTitle}</div>
              </div>
              {res.schritte.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14,paddingBottom:14,borderBottom:i<res.schritte.length-1?`1px solid ${T.borderL}`:"none"}}>
                  <div style={{width:28,height:28,minWidth:28,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{i+1}</div>
                  <div style={{fontSize:15,lineHeight:1.6,paddingTop:3,direction:ln.dir,color:T.ink}}>{s}</div>
                </div>
              ))}
            </Card>
          )}

          {!reply && !replyLoading && <Btn icon="✍️" onClick={genReply}>{u.replyBtn}</Btn>}
          {replyLoading && <Card><Spinner text={u.replyLoading}/></Card>}
          {reply && (
            <Card style={{background:"linear-gradient(180deg,#FFFBEB,#FFFFFF)",border:`1px solid #FDE68A`}}>
              <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:14}}>✉️ {u.replyTitle}</div>
              <div style={{background:"white",border:`1px solid ${T.border}`,borderRadius:12,padding:18,fontFamily:"monospace",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:14}}>{reply}</div>
              <CopyBtn u={u} text={reply}/>
            </Card>
          )}
          <Btn onClick={reset} variant="ghost" icon="↻">{u.newScan}</Btn>
        </div>
      )}
    </div>
  );
}

function ChatTab({lang, prefilledContext}) {
  const ln = getLang(lang); const u = getUI(lang);
  const SYS = `Du bist ein freundlicher Helfer für Ausländer in Deutschland. Antworte auf ${ln.label} — kurze klare Sätze. Briefe immer auf PERFEKTEM DEUTSCH.`;
  const initialMsg = prefilledContext
    ? {role:"assistant",content:prefilledContext.greeting,intro:true}
    : {role:"assistant",content:u.chatHello,intro:true};
  const [msgs,setMsgs]=useState([initialMsg]);
  const [input,setInput]=useState("");const[loading,setLoading]=useState(false);const[showQ,setShowQ]=useState(true);
  const bottomRef=useRef();
  async function send(text){const msg=text||input;if(!msg.trim()||loading)return;setInput("");setShowQ(false);const nm=[...msgs,{role:"user",content:msg}];setMsgs(nm);setLoading(true);try{const r=await callClaude(nm.filter(m=>!m.intro).map(m=>({role:m.role,content:m.content})),SYS,1400,"claude-haiku-4-5-20251001");setMsgs([...nm,{role:"assistant",content:r}]);}catch(e){setMsgs([...nm,{role:"assistant",content:u.chatError+": "+e.message}]);}setLoading(false);setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);}

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {showQ && (
        <Card>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:16,direction:ln.dir}}>{u.chatWhat}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {u.quick.map(a => (
              <button key={a.label} onClick={()=>send(a.prompt)} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 12px",cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
                <div style={{fontSize:28,marginBottom:6}}>{a.icon}</div>
                <div style={{fontSize:13,fontWeight:600,color:T.ink,lineHeight:1.3,whiteSpace:"pre",direction:ln.dir}}>{a.label}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",flexDirection:"column",gap:14,maxHeight:440,overflowY:"auto",padding:18}}>
          {msgs.map((m,i) => (
            <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%",background:m.role==="user"?T.brand:T.surfaceAlt,color:m.role==="user"?"white":T.ink,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"14px 16px",fontSize:15,lineHeight:1.6,whiteSpace:"pre-wrap",direction:ln.dir}}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{alignSelf:"flex-start",background:T.surfaceAlt,borderRadius:"18px 18px 18px 4px",padding:"14px 18px",display:"flex",gap:6}}>
              {[0,.15,.3].map(d => <span key={d} style={{width:8,height:8,background:T.inkMute,borderRadius:"50%",animation:`bounce 1.2s ${d}s infinite`}}/>)}
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,padding:14,display:"flex",gap:10,alignItems:"flex-end",background:T.surfaceAlt}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={u.chatPlaceholder}
            style={{flex:1,background:"white",border:`1px solid ${T.border}`,borderRadius:12,color:T.ink,padding:"12px 14px",fontFamily:"inherit",fontSize:15,outline:"none",resize:"none",height:48,direction:ln.dir}} dir={ln.dir}/>
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:48,height:48,background:T.brand,color:"white",border:"none",borderRadius:12,fontSize:18,cursor:"pointer",opacity:loading||!input.trim()?.4:1}}>↑</button>
        </div>
      </Card>
      {!showQ && <Btn onClick={()=>setShowQ(true)} variant="ghost">{u.chatBack}</Btn>}
    </div>
  );
}

function FormsTab({lang}) {
  const ln=getLang(lang);const u=getUI(lang);
  const[sel,setSel]=useState(null);const[qs,setQs]=useState([]);const[step,setStep]=useState(0);
  const[answers,setAnswers]=useState({});const[curAns,setCurAns]=useState("");const[result,setResult]=useState("");const[loading,setLoading]=useState(false);

  async function startForm(form){setSel(form);setStep(0);setAnswers({});setResult("");setQs([]);setLoading(true);
    try{const raw=await callClaude([{role:"user",content:`Formular: "${form.label}". Stelle 5 einfache Fragen auf ${ln.label}. NUR JSON Array:\n[{"id":"q0","frage":"Frage","beispiel":"Beispiel","pflicht":true}]`}],"NUR JSON.",600,"claude-haiku-4-5-20251001");setQs(JSON.parse(raw.replace(/```json|```/g,"").trim()));}
    catch{setQs([{id:"q0",frage:"Ihr Name?",beispiel:"Max Mustermann",pflicht:true},{id:"q1",frage:"Adresse?",beispiel:"Musterstr. 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Geburtsdatum?",beispiel:"01.01.1990",pflicht:true}]);}
    setLoading(false);}
  async function nextStep(){const na={...answers,[qs[step].id]:curAns};setAnswers(na);setCurAns("");
    if(step+1>=qs.length){setLoading(true);const txt=qs.map(q=>`${q.frage}: ${na[q.id]||"—"}`).join("\n");try{const r=await callClaude([{role:"user",content:`Erstelle deutschen Antrag für "${sel.label}".\n\nAngaben:\n${txt}`}],"Formeller Brief auf Deutsch.",1500);setResult(r);}catch(e){setResult("Fehler: "+e.message);}setLoading(false);}else{setStep(step+1);}}

  if(!sel) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{fontSize:24,fontWeight:700,color:T.ink,direction:ln.dir}}>{u.formsTitle}</h2>
      {u.forms.map(f => (
        <button key={f.id} onClick={()=>startForm(f)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",fontFamily:"inherit"}}>
          <div style={{width:52,height:52,background:f.bg,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{f.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:600,color:T.ink}}>{f.label}</div>
            <div style={{fontSize:13,color:T.inkMute}}>{f.behoerde}</div>
          </div>
          <div style={{fontSize:18,color:T.inkMute}}>›</div>
        </button>
      ))}
    </div>
  );

  if(result) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#10B981,#059669)",borderRadius:18,padding:"28px 22px",color:"white",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:8}}>✓</div>
        <div style={{fontSize:20,fontWeight:700}}>{sel.label}</div>
        <div style={{fontSize:14,opacity:0.9,marginTop:4}}>{u.formDone}</div>
      </div>
      <Card>
        <div style={{background:T.surfaceAlt,borderRadius:12,padding:18,fontFamily:"monospace",fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{result}</div>
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
          <button onClick={()=>setSel(null)} style={{background:T.borderL,border:"none",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontSize:18,color:T.inkSoft}}>←</button>
          <div style={{width:42,height:42,background:sel.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{sel.icon}</div>
          <div style={{fontSize:16,fontWeight:600,color:T.ink}}>{sel.label}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.inkSoft,marginBottom:8}}>
          <span>{step+1} / {qs.length}</span>
          <span style={{color:T.accent,fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{height:6,background:T.borderL,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.accent},${T.accent2})`,borderRadius:3,transition:"width 400ms"}}/>
        </div>
      </Card>

      <Card>
        <div style={{fontSize:11,fontWeight:600,color:q.pflicht?T.danger:T.inkMute,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,direction:ln.dir}}>{q.pflicht?u.formRequired:u.formOptional}</div>
        <div style={{fontSize:22,fontWeight:700,color:T.ink,marginBottom:10,lineHeight:1.3,direction:ln.dir}}>{q.frage}</div>
        {q.beispiel && <div style={{fontSize:14,color:T.inkMute,marginBottom:18,direction:ln.dir}}>z.B.: {q.beispiel}</div>}
        <textarea autoFocus value={curAns} onChange={e=>setCurAns(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();nextStep();}}}
          style={{width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:12,color:T.ink,padding:"14px 16px",fontFamily:"inherit",fontSize:16,outline:"none",resize:"none",minHeight:90,lineHeight:1.5,direction:ln.dir}} dir={ln.dir}/>
      </Card>

      <Btn onClick={nextStep} disabled={q.pflicht&&!curAns.trim()} icon={step+1>=qs.length?"✓":"→"}>{step+1>=qs.length?u.formCreate:u.formNext}</Btn>
      {!q.pflicht && (
        <button onClick={()=>{setCurAns("");nextStep();}} style={{background:"none",border:"none",color:T.inkMute,cursor:"pointer",fontSize:14,textDecoration:"underline",fontFamily:"inherit"}}>{u.formSkip}</button>
      )}
    </div>
  );
}

export default function App() {
  const [tab,setTab] = useState("chat");
  const [lang,setLang] = useState("de");
  const [showLP,setShowLP] = useState(false);
  const [chatContext,setChatContext] = useState(null);
  const ln = getLang(lang); const u = getUI(lang);

  function handleBehoerdeBrief(beh, stadt, bundesland) {
    setChatContext({
      greeting:`👋 Sie möchten an die ${beh.name} in ${stadt}${bundesland?`, ${bundesland}`:""} schreiben?\n\nWas ist Ihr Anliegen?`,
    });
    setTab("chat");
  }

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter Tight',sans-serif",maxWidth:520,margin:"0 auto",direction:ln.dir}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};font-family:'Inter Tight',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        button:active{transform:scale(0.97)}
      `}</style>

      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,background:T.brand,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🇩🇪</div>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:T.ink}}>Behörden Assistent</div>
            <div style={{fontSize:11,color:T.inkMute}}>{u.appSub}</div>
          </div>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLP(!showLP)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",fontSize:14,fontWeight:600,color:T.ink,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>
            {ln.flag} <span>{ln.label}</span> ▾
          </button>
          {showLP && (
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:6,zIndex:200,minWidth:180,boxShadow:"0 12px 40px rgba(0,0,0,0.12)",maxHeight:340,overflowY:"auto"}}>
              {LANGS.map(l => (
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLP(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:lang===l.code?T.borderL:"transparent",border:"none",borderRadius:8,padding:"10px 12px",color:T.ink,cursor:"pointer",fontSize:14,fontFamily:"inherit",fontWeight:lang===l.code?700:500}}>
                  <span style={{fontSize:18}}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",padding:"10px 14px 12px",display:"flex",gap:6,position:"sticky",top:69,zIndex:90,borderBottom:`1px solid ${T.border}`}}>
        {[
          {id:"scan",icon:"📷",label:u.tab1},
          {id:"chat",icon:"✨",label:u.tab2},
          {id:"forms",icon:"📋",label:u.tab3},
          {id:"laender",icon:"📍",label:u.tab4},
        ].map(t => (
          <button key={t.id} onClick={()=>{setTab(t.id);if(t.id!=="chat")setChatContext(null);}} style={{flex:1,background:tab===t.id?T.brand:T.surface,border:tab===t.id?"none":`1px solid ${T.border}`,borderRadius:11,padding:"10px 4px",cursor:"pointer",fontSize:11,fontWeight:tab===t.id?700:600,color:tab===t.id?"white":T.inkSoft,display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"inherit",transition:"all 200ms",boxShadow:tab===t.id?"0 4px 14px rgba(15,23,42,0.22)":"none"}}>
            <span style={{fontSize:18}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:"16px 14px 90px"}}>
        {tab==="scan"   && <ScanTab  lang={lang}/>}
        {tab==="chat"   && <ChatTab  lang={lang} prefilledContext={chatContext}/>}
        {tab==="forms"  && <FormsTab lang={lang}/>}
        {tab==="laender"&& <BundeslandDatenbank onSelectBehoerde={handleBehoerdeBrief}/>}
      </div>

      <div style={{textAlign:"center",padding:"12px 14px",color:T.inkMute,fontSize:11,background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520}}>
        {u.footer}
      </div>
    </div>
  );
}
