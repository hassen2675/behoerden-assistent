import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import BundeslandDatenbank from "./BundeslandDatenbank";

// ─── SPRACHEN ──────────────────────────────────────────────────────────────
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

// ─── UI ────────────────────────────────────────────────────────────────────
const UI_DE = {
  appSub:"KI-Assistent für Ausländer in Deutschland",
  tab1:"Briefe", tab2:"Chat", tab3:"Formular", tab4:"Behörden", tab5:"Profil",
  footer:"KI-generiert — vor dem Absenden prüfen",
  scanTitle:"Brief fotografieren", scanSub:"Foto vom Brief machen\nDie KI liest und erklärt alles",
  scanCamera:"Kamera", scanGallery:"Galerie", scanAnalyze:"Analysieren",
  scanLoading:"Brief wird gelesen...", transTitle:"Übersetzung", explainTitle:"Was bedeutet das?",
  stepsTitle:"Was tun?", replyBtn:"Antwort schreiben", replyLoading:"Brief wird geschrieben...",
  replyTitle:"Ihr Antwortbrief", copyBtn:"Kopieren", copied:"Kopiert", scanError:"Fehler! Deutlicheres Foto",
  urgHoch:"Dringend", urgMittel:"Wichtig", urgNiedrig:"Normal",
  chatHello:"Hallo 👋\n\nIch helfe mit deutschen Behörden\n\nWählen oder schreiben Sie",
  chatWhat:"Was möchten Sie?", chatBack:"Zurück", chatPlaceholder:"Hier schreiben...",
  chatError:"Verbindungsfehler", chatLetter:"Fertiger Brief:",
  // Profil
  profileTitle:"Mein Profil", profileSub:"Ihre Daten werden automatisch in Briefe eingefügt",
  profileSection1:"👤 Persönliche Daten", profileSection2:"🪪 Aufenthalt",
  profileSection3:"📊 Steuer & Bank", profileSection4:"👨‍👩‍👧 Familie",
  profileSave:"Speichern", profileSaved:"✓ Gespeichert!", profileClear:"Alle Daten löschen",
  profileFamilyAdd:"+ Familienmitglied hinzufügen",
  profileNoData:"⚠️ Kein Profil — Bitte zuerst im Tab 'Profil' Ihre Daten eingeben",
  fieldName:"Vollständiger Name", fieldStreet:"Straße + Nummer", fieldZip:"PLZ + Stadt",
  fieldPhone:"Telefon", fieldEmail:"E-Mail", fieldBirth:"Geburtsdatum", fieldBirthplace:"Geburtsort",
  fieldNationality:"Staatsangehörigkeit", fieldPermitType:"Aufenthaltstitel-Art",
  fieldPermitNum:"Aufenthaltstitel-Nummer", fieldPermitValid:"Gültig bis",
  fieldTaxId:"Steuer-ID", fieldIban:"IBAN (optional)",
  fieldFamilyName:"Name", fieldFamilyRelation:"Beziehung", fieldFamilyBirth:"Geburtsdatum",
  // Briefe-Tab
  briefeTitle:"Meine Briefe", briefeEmpty:"Noch keine Briefe gespeichert",
  briefeEmptySub:"Tippen Sie auf 'Neuer Brief' und fotografieren Sie einen Behördenbrief",
  briefeNew:"+ Neuer Brief", briefeSearch:"Suchen...",
  briefeFilterAll:"Alle", briefeFilterOpen:"Offen", briefeFilterDone:"Erledigt",
  briefeStatusOpen:"Offen", briefeStatusDone:"Erledigt", briefeMarkDone:"Als erledigt markieren",
  briefeMarkOpen:"Wieder öffnen", briefeDelete:"Löschen", briefeNote:"Notiz",
  briefeNotePh:"Eigene Notiz hinzufügen...", briefeBack:"← Zurück zur Liste",
  briefeDeleteConfirm:"Diesen Brief wirklich löschen?",
  // Termine
  terminTitle:"⏰ Wichtige Termine", terminToday:"Heute",
  terminThisWeek:"Diese Woche", terminNextWeek:"Nächste Woche", terminLater:"Später",
  terminOverdue:"⚠️ Frist überschritten", terminInDays:"in {n} Tagen",
  terminTomorrow:"Morgen", terminPassed:"vor {n} Tagen",
  termin0:"❗ HEUTE!", terminWarning:"Frist:",
  // Save
  briefSaved:"✓ Brief gespeichert"
};
const UI = { de: UI_DE };
["en","ar","tr","uk","ru","fa","fr","es"].forEach(c => UI[c] = UI_DE);

function getUI(lang){ return UI[lang] || UI.de; }
function getLang(code){ return LANGS.find(l=>l.code===code)||LANGS[0]; }

// ─── STORAGE: Profil ────────────────────────────────────────────────────────
const PROFILE_KEY = "behoerden_profil_v1";
const BRIEFE_KEY = "behoerden_briefe_v1";

function loadProfile() {
  try { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveProfile(p) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); return true; }
  catch { return false; }
}
function clearProfile() { localStorage.removeItem(PROFILE_KEY); }

// ─── STORAGE: Briefe ────────────────────────────────────────────────────────
function loadBriefe() {
  try { const r = localStorage.getItem(BRIEFE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveBriefe(briefe) {
  try { localStorage.setItem(BRIEFE_KEY, JSON.stringify(briefe)); return true; }
  catch (e) {
    // Speicher voll — älteste Briefe löschen
    if (briefe.length > 5) {
      const trimmed = briefe.slice(0, briefe.length - 1);
      try { localStorage.setItem(BRIEFE_KEY, JSON.stringify(trimmed)); return true; }
      catch { return false; }
    }
    return false;
  }
}

function profileToText(p) {
  if (!p) return "";
  const lines = [];
  if (p.name) lines.push(`Name: ${p.name}`);
  if (p.street) lines.push(`Straße: ${p.street}`);
  if (p.zip) lines.push(`PLZ/Ort: ${p.zip}`);
  if (p.phone) lines.push(`Telefon: ${p.phone}`);
  if (p.email) lines.push(`E-Mail: ${p.email}`);
  if (p.birth) lines.push(`Geburtsdatum: ${p.birth}`);
  if (p.birthplace) lines.push(`Geburtsort: ${p.birthplace}`);
  if (p.nationality) lines.push(`Staatsangehörigkeit: ${p.nationality}`);
  if (p.permitType) lines.push(`Aufenthaltstitel: ${p.permitType}`);
  if (p.permitNum) lines.push(`Aufenthaltsnummer: ${p.permitNum}`);
  if (p.permitValid) lines.push(`Gültig bis: ${p.permitValid}`);
  if (p.taxId) lines.push(`Steuer-ID: ${p.taxId}`);
  if (p.iban) lines.push(`IBAN: ${p.iban}`);
  if (p.family && p.family.length > 0) {
    lines.push(`Familie:`);
    p.family.forEach(f => lines.push(`  - ${f.name} (${f.relation}, geb. ${f.birth})`));
  }
  return lines.join("\n");
}

// ─── DATUMS-LOGIK für Termine ─────────────────────────────────────────────
function parseFrist(fristStr) {
  if (!fristStr) return null;
  // Versucht Datum aus Text zu extrahieren (DD.MM.YYYY oder YYYY-MM-DD)
  const dotMatch = fristStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (dotMatch) {
    const [, d, m, y] = dotMatch;
    const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
    return new Date(year, parseInt(m)-1, parseInt(d));
  }
  const isoMatch = fristStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  }
  return null;
}

function daysUntil(fristDate) {
  if (!fristDate) return null;
  const now = new Date();
  now.setHours(0,0,0,0);
  const target = new Date(fristDate);
  target.setHours(0,0,0,0);
  return Math.round((target - now) / (1000*60*60*24));
}

function getUrgencyColor(brief, T) {
  const fristDate = parseFrist(brief.frist);
  if (!fristDate) {
    if (brief.dringlichkeit === "hoch") return { color:T.danger, bg:T.dangerL, label:"Dringend" };
    if (brief.dringlichkeit === "mittel") return { color:T.warning, bg:T.warningL, label:"Wichtig" };
    return { color:T.success, bg:T.successL, label:"Normal" };
  }
  const days = daysUntil(fristDate);
  if (days < 0) return { color:T.danger, bg:T.dangerL, label:`⚠️ ${Math.abs(days)} Tage überfällig` };
  if (days === 0) return { color:T.danger, bg:T.dangerL, label:"❗ HEUTE!" };
  if (days === 1) return { color:T.danger, bg:T.dangerL, label:"❗ Morgen!" };
  if (days <= 7) return { color:T.danger, bg:T.dangerL, label:`🔴 in ${days} Tagen` };
  if (days <= 14) return { color:T.warning, bg:T.warningL, label:`🟠 in ${days} Tagen` };
  return { color:T.success, bg:T.successL, label:`🟢 in ${days} Tagen` };
}

// ─── API CALL ──────────────────────────────────────────────────────────────
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

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const T = {
  bg:"#FAFAF9", surface:"#FFFFFF", surfaceAlt:"#FAFAF9",
  brand:"#0F172A", brandLight:"#1E293B",
  accent:"#3B82F6", accent2:"#8B5CF6",
  success:"#10B981", successL:"#ECFDF5",
  warning:"#F59E0B", warningL:"#FFFBEB",
  danger:"#EF4444", dangerL:"#FEF2F2",
  ink:"#0F172A", inkSoft:"#475569", inkMute:"#94A3B8",
  border:"#E2E8F0", borderL:"#F1F5F9",
};

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────
function Btn({children, onClick, disabled, variant="primary", icon, style={}}) {
  const variants = {
    primary: { bg:T.brand, fg:"white", shadow:"0 8px 24px rgba(15,23,42,0.18)" },
    accent:  { bg:T.accent, fg:"white", shadow:"0 8px 24px rgba(59,130,246,0.35)" },
    success: { bg:T.success, fg:"white", shadow:"0 8px 24px rgba(16,185,129,0.35)" },
    danger:  { bg:T.danger, fg:"white", shadow:"0 8px 24px rgba(239,68,68,0.35)" },
    ghost:   { bg:"transparent", fg:T.ink, shadow:"none", border:`1.5px solid ${T.border}` },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:"100%",padding:"14px 20px",
        background:disabled?"#E5E7EB":v.bg, color:disabled?"#9CA3AF":v.fg,
        border:v.border||"none", borderRadius:14, fontSize:15, fontWeight:600,
        cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit",
        boxShadow:disabled?"none":v.shadow,
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        transition:"all 200ms", ...style}}>
      {icon && <span style={{fontSize:18}}>{icon}</span>}{children}
    </button>
  );
}

function Card({children, style={}}) {
  return <div style={{background:T.surface,borderRadius:18,padding:"20px",border:`1px solid ${T.border}`,boxShadow:"0 1px 2px rgba(0,0,0,0.03)",...style}}>{children}</div>;
}

function Spinner({text}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"40px 20px"}}>
      <div style={{width:44,height:44,border:`3px solid ${T.borderL}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{fontSize:14,color:T.inkSoft,fontWeight:500,textAlign:"center"}}>{text}</div>
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

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL TAB
// ═══════════════════════════════════════════════════════════════════════════
function ProfileTab({profile, setProfile, lang}) {
  const u = getUI(lang);
  const [local, setLocal] = useState(profile || {
    name:"", street:"", zip:"", phone:"", email:"", birth:"", birthplace:"",
    nationality:"", permitType:"", permitNum:"", permitValid:"",
    taxId:"", iban:"", family:[],
  });
  const [saved, setSaved] = useState(false);

  function update(field, value) { setLocal({...local, [field]: value}); }
  function save() {
    saveProfile(local); setProfile(local);
    setSaved(true); setTimeout(()=>setSaved(false), 2500);
  }
  function clear() {
    if (!confirm("Wirklich alle Profildaten löschen?")) return;
    clearProfile(); setProfile(null);
    setLocal({name:"",street:"",zip:"",phone:"",email:"",birth:"",birthplace:"",nationality:"",permitType:"",permitNum:"",permitValid:"",taxId:"",iban:"",family:[]});
  }
  function addFamily() { setLocal({...local, family: [...(local.family||[]), {name:"", relation:"", birth:""}]}); }
  function updateFamily(idx, field, value) {
    const fam = [...(local.family||[])]; fam[idx] = {...fam[idx], [field]: value};
    setLocal({...local, family: fam});
  }
  function removeFamily(idx) { const fam = [...(local.family||[])]; fam.splice(idx, 1); setLocal({...local, family: fam}); }

  const inputStyle = {width:"100%",background:T.surfaceAlt,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"12px 14px",fontSize:15,color:T.ink,outline:"none",fontFamily:"inherit",marginBottom:10};
  const labelStyle = {fontSize:12,fontWeight:600,color:T.inkSoft,textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:6,marginTop:8};
  const sectionStyle = {fontSize:16,fontWeight:700,color:T.ink,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${T.borderL}`};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg, #0F172A, #1E293B, #312E81)",borderRadius:20,padding:"24px 22px",color:"white",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,background:"radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(40px)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:36,marginBottom:8}}>👤</div>
          <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>{u.profileTitle}</div>
          <div style={{fontSize:14,opacity:0.85,lineHeight:1.5}}>{u.profileSub}</div>
        </div>
      </div>

      <div style={{background:"linear-gradient(135deg, #ECFDF5, #D1FAE5)",border:`2px solid ${T.success}`,borderRadius:16,padding:"18px 20px",boxShadow:"0 4px 16px rgba(16,185,129,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:44,height:44,background:T.success,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🔒</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"#065F46"}}>100% Datenschutz</div>
            <div style={{fontSize:12,fontWeight:600,color:"#047857"}}>Privacy First — Privatsphäre garantiert</div>
          </div>
        </div>
        <div style={{fontSize:13,color:"#065F46",lineHeight:1.6,fontWeight:500}}>
          ✓ Daten bleiben <strong>NUR auf Ihrem Handy</strong><br/>
          ✓ <strong>NICHT</strong> an Server gesendet<br/>
          ✓ <strong>NIEMAND</strong> kann sie sehen
        </div>
      </div>

      <Card>
        <div style={sectionStyle}>{u.profileSection1}</div>
        <label style={labelStyle}>{u.fieldName}</label>
        <input style={inputStyle} value={local.name} onChange={e=>update("name",e.target.value)} placeholder="Max Mustermann"/>
        <label style={labelStyle}>{u.fieldStreet}</label>
        <input style={inputStyle} value={local.street} onChange={e=>update("street",e.target.value)} placeholder="Musterstraße 1"/>
        <label style={labelStyle}>{u.fieldZip}</label>
        <input style={inputStyle} value={local.zip} onChange={e=>update("zip",e.target.value)} placeholder="10115 Berlin"/>
        <label style={labelStyle}>{u.fieldPhone}</label>
        <input style={inputStyle} value={local.phone} onChange={e=>update("phone",e.target.value)} type="tel"/>
        <label style={labelStyle}>{u.fieldEmail}</label>
        <input style={inputStyle} value={local.email} onChange={e=>update("email",e.target.value)} type="email"/>
        <label style={labelStyle}>{u.fieldBirth}</label>
        <input style={inputStyle} value={local.birth} onChange={e=>update("birth",e.target.value)} placeholder="01.01.1990"/>
        <label style={labelStyle}>{u.fieldBirthplace}</label>
        <input style={inputStyle} value={local.birthplace} onChange={e=>update("birthplace",e.target.value)}/>
        <label style={labelStyle}>{u.fieldNationality}</label>
        <input style={inputStyle} value={local.nationality} onChange={e=>update("nationality",e.target.value)}/>
      </Card>

      <Card>
        <div style={sectionStyle}>{u.profileSection2}</div>
        <label style={labelStyle}>{u.fieldPermitType}</label>
        <input style={inputStyle} value={local.permitType} onChange={e=>update("permitType",e.target.value)} placeholder="z.B. Niederlassungserlaubnis"/>
        <label style={labelStyle}>{u.fieldPermitNum}</label>
        <input style={inputStyle} value={local.permitNum} onChange={e=>update("permitNum",e.target.value)}/>
        <label style={labelStyle}>{u.fieldPermitValid}</label>
        <input style={inputStyle} value={local.permitValid} onChange={e=>update("permitValid",e.target.value)} placeholder="31.12.2030"/>
      </Card>

      <Card>
        <div style={sectionStyle}>{u.profileSection3}</div>
        <label style={labelStyle}>{u.fieldTaxId}</label>
        <input style={inputStyle} value={local.taxId} onChange={e=>update("taxId",e.target.value)} placeholder="11 Ziffern"/>
        <label style={labelStyle}>{u.fieldIban}</label>
        <input style={inputStyle} value={local.iban} onChange={e=>update("iban",e.target.value)}/>
      </Card>

      <Card>
        <div style={sectionStyle}>{u.profileSection4}</div>
        {(local.family || []).map((f, idx) => (
          <div key={idx} style={{background:T.surfaceAlt,borderRadius:12,padding:14,marginBottom:10,position:"relative"}}>
            <button onClick={()=>removeFamily(idx)} style={{position:"absolute",top:8,right:8,background:T.dangerL,border:"none",borderRadius:8,width:30,height:30,fontSize:18,color:T.danger,cursor:"pointer",fontFamily:"inherit"}}>×</button>
            <label style={labelStyle}>{u.fieldFamilyName}</label>
            <input style={inputStyle} value={f.name} onChange={e=>updateFamily(idx,"name",e.target.value)}/>
            <label style={labelStyle}>{u.fieldFamilyRelation}</label>
            <input style={inputStyle} value={f.relation} onChange={e=>updateFamily(idx,"relation",e.target.value)} placeholder="z.B. Ehefrau / Sohn"/>
            <label style={labelStyle}>{u.fieldFamilyBirth}</label>
            <input style={inputStyle} value={f.birth} onChange={e=>updateFamily(idx,"birth",e.target.value)}/>
          </div>
        ))}
        <Btn onClick={addFamily} variant="ghost" icon="+" style={{padding:"10px"}}>{u.profileFamilyAdd}</Btn>
      </Card>

      <Btn onClick={save} variant={saved?"success":"primary"} icon={saved?"✓":"💾"}>
        {saved ? u.profileSaved : u.profileSave}
      </Btn>

      <button onClick={clear} style={{background:"transparent",border:"none",color:T.danger,cursor:"pointer",fontSize:13,padding:"12px",fontFamily:"inherit",textDecoration:"underline"}}>
        🗑️ {u.profileClear}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCAN — neuen Brief aufnehmen
// ═══════════════════════════════════════════════════════════════════════════
function ScanView({lang, profile, briefe, setBriefe, onClose}) {
  const ln = getLang(lang); const u = getUI(lang);
  const [img,setImg]=useState(null);const[mt,setMt]=useState("image/jpeg");
  const [prev,setPrev]=useState(null);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const fileRef=useRef(); const camRef=useRef();

  const handleFile = useCallback(async(file)=>{
    if(!file||!file.type.startsWith("image/")){setErr(u.scanError);return;}
    setErr(""); setPrev(URL.createObjectURL(file)); setMt(mtype(file));
    setImg(await toB64(file));
  },[u]);

  async function analyzeAndSave(){
    setLoading(true);
    try {
      const raw = await callClaude([{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:mt,data:img}},
        {type:"text",text:`Analysiere diesen deutschen Behördenbrief. NUR JSON ohne Backticks:\n{"behoerde":"...","betreff":"...","datum":"...","dringlichkeit":"hoch|mittel|niedrig","frist":"...oder null","uebersetzung":"Übersetzung auf ${ln.label}","erklaerung":"Erklärung auf ${ln.label}","schritte":["Schritt 1","Schritt 2"],"originaltext":"Text"}`}
      ]}],"OCR. NUR JSON.",1500);
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());

      // Brief speichern!
      const newBrief = {
        id: "brief_" + Date.now(),
        savedAt: new Date().toISOString(),
        thumbnail: img.substring(0, 100), // klein halten
        ...parsed,
        erledigt: false,
        notiz: "",
        antwort: ""
      };
      const updated = [newBrief, ...briefe];
      saveBriefe(updated);
      setBriefe(updated);

      // Zur Liste zurück, dann den neuen Brief öffnen
      onClose(newBrief.id);
    } catch(e) {
      setErr(u.scanError);
    }
    setLoading(false);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>

      <button onClick={()=>onClose()} style={{background:"transparent",border:"none",color:T.inkSoft,cursor:"pointer",fontSize:14,padding:"6px 0",textAlign:"left",fontFamily:"inherit",fontWeight:500}}>
        {u.briefeBack}
      </button>

      {!prev && (
        <div style={{position:"relative",background:"linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%)",borderRadius:24,padding:"48px 28px 36px",color:"white",textAlign:"center",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:"radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",borderRadius:"50%",filter:"blur(40px)"}}/>
          <div style={{position:"relative",zIndex:1}}>
            <div style={{width:80,height:80,background:"rgba(255,255,255,0.15)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 20px"}}>📄</div>
            <h2 style={{fontSize:26,fontWeight:700,marginBottom:10}}>{u.scanTitle}</h2>
            <p style={{fontSize:14,opacity:0.7,lineHeight:1.6,whiteSpace:"pre-line"}}>{u.scanSub}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:24}}>
              <button onClick={()=>camRef.current.click()} style={{background:"white",color:T.brand,border:"none",borderRadius:14,padding:"16px 22px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                📷 {u.scanCamera}
              </button>
              <button onClick={()=>fileRef.current.click()} style={{background:"rgba(255,255,255,0.1)",color:"white",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,padding:"16px 22px",fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                🖼️ {u.scanGallery}
              </button>
            </div>
          </div>
        </div>
      )}

      {prev && (
        <Card>
          <img src={prev} alt="Brief" style={{width:"100%",borderRadius:14,maxHeight:320,objectFit:"contain",background:T.borderL}}/>
          {err && <div style={{color:T.danger,fontSize:14,fontWeight:600,textAlign:"center",marginTop:14,padding:14,background:T.dangerL,borderRadius:12}}>{err}</div>}
          {!loading && (
            <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
              <Btn icon="⚡" onClick={analyzeAndSave} variant="accent">{u.scanAnalyze}</Btn>
              <Btn onClick={()=>{setPrev(null);setImg(null);setErr("");}} variant="ghost">↻ Neu</Btn>
            </div>
          )}
          {loading && <Spinner text={u.scanLoading}/>}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BRIEF DETAIL — einzelnen Brief anzeigen
// ═══════════════════════════════════════════════════════════════════════════
function BriefDetail({brief, lang, profile, briefe, setBriefe, onBack}) {
  const ln = getLang(lang); const u = getUI(lang);
  const [reply, setReply] = useState(brief.antwort || "");
  const [replyLoading, setReplyLoading] = useState(false);
  const [notiz, setNotiz] = useState(brief.notiz || "");

  function updateBrief(updates) {
    const updated = briefe.map(b => b.id === brief.id ? {...b, ...updates} : b);
    saveBriefe(updated); setBriefe(updated);
  }

  function toggleDone() { updateBrief({erledigt: !brief.erledigt}); }

  function deleteBrief() {
    if (!confirm(u.briefeDeleteConfirm)) return;
    const updated = briefe.filter(b => b.id !== brief.id);
    saveBriefe(updated); setBriefe(updated);
    onBack();
  }

  async function genReply() {
    setReplyLoading(true);
    const profileText = profileToText(profile);
    const sys = `Du bist Experte für deutsche Behördenbriefe. Schreibe einen vollständigen, formellen Antwortbrief auf perfektem Deutsch mit korrektem Briefkopf.${profileText ? `\n\nABSENDER (oben in den Brief):\n${profileText}` : ""}`;
    try {
      const r = await callClaude([{role:"user",content:`Schreibe Antwortbrief.\nBehörde: ${brief.behoerde}\nBetreff: ${brief.betreff}\nDatum: ${new Date().toLocaleDateString("de-DE")}\nOriginaltext: ${brief.originaltext}`}],sys,1500);
      setReply(r);
      updateBrief({antwort: r});
    } catch(e) { setReply("Fehler: "+e.message); }
    setReplyLoading(false);
  }

  function saveNotiz() { updateBrief({notiz}); }

  const urg = getUrgencyColor(brief, T);
  const fristDate = parseFrist(brief.frist);
  const days = fristDate ? daysUntil(fristDate) : null;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:T.inkSoft,cursor:"pointer",fontSize:14,padding:"6px 0",textAlign:"left",fontFamily:"inherit",fontWeight:500}}>
        {u.briefeBack}
      </button>

      <Card style={brief.erledigt ? {opacity:0.7} : {}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,color:T.inkMute,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Absender</div>
            <div style={{fontSize:18,fontWeight:700,color:T.ink}}>{brief.behoerde}</div>
          </div>
          <span style={{display:"inline-flex",background:urg.bg,color:urg.color,padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{urg.label}</span>
        </div>
        <div style={{fontSize:14,fontWeight:500,color:T.inkSoft,marginBottom:6,lineHeight:1.5}}>{brief.betreff}</div>
        {brief.datum && <div style={{fontSize:13,color:T.inkMute}}>📅 Briefdatum: {brief.datum}</div>}
        {brief.frist && (
          <div style={{background:T.dangerL,border:`1.5px solid ${T.danger}`,borderRadius:12,padding:"12px 14px",marginTop:14}}>
            <div style={{fontSize:12,fontWeight:700,color:T.danger,textTransform:"uppercase",marginBottom:2}}>{u.terminWarning}</div>
            <div style={{fontSize:15,fontWeight:700,color:T.danger}}>{brief.frist}</div>
            {days !== null && (
              <div style={{fontSize:13,color:T.danger,marginTop:4}}>
                {days < 0 ? `${Math.abs(days)} Tage überschritten!` :
                 days === 0 ? "❗ HEUTE!" :
                 days === 1 ? "Morgen!" : `In ${days} Tagen`}
              </div>
            )}
          </div>
        )}
        {brief.erledigt && (
          <div style={{background:T.successL,border:`1.5px solid ${T.success}`,borderRadius:10,padding:"8px 12px",marginTop:12,fontSize:13,color:"#065F46",fontWeight:600,textAlign:"center"}}>
            ✓ {u.briefeStatusDone}
          </div>
        )}
      </Card>

      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#3B82F6,#1D4ED8)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white"}}>🌐</div>
          <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{u.transTitle}</div>
        </div>
        <div style={{fontSize:14,color:T.ink,lineHeight:1.6,direction:ln.dir,whiteSpace:"pre-wrap"}}>{brief.uebersetzung}</div>
      </Card>

      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#10B981,#059669)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white"}}>💡</div>
          <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{u.explainTitle}</div>
        </div>
        <div style={{fontSize:14,color:T.ink,lineHeight:1.6,direction:ln.dir,whiteSpace:"pre-wrap"}}>{brief.erklaerung}</div>
      </Card>

      {brief.schritte?.length > 0 && (
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"white"}}>📋</div>
            <div style={{fontSize:14,fontWeight:700,color:T.ink}}>{u.stepsTitle}</div>
          </div>
          {brief.schritte.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
              <div style={{width:24,height:24,minWidth:24,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"white",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{i+1}</div>
              <div style={{fontSize:14,lineHeight:1.5,direction:ln.dir,color:T.ink}}>{s}</div>
            </div>
          ))}
        </Card>
      )}

      {!reply && !replyLoading && <Btn icon="✍️" onClick={genReply}>{u.replyBtn}</Btn>}
      {replyLoading && <Card><Spinner text={u.replyLoading}/></Card>}
      {reply && (
        <Card style={{background:"linear-gradient(180deg,#FFFBEB,#FFFFFF)",border:`1px solid #FDE68A`}}>
          <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:14}}>✉️ {u.replyTitle}</div>
          <div style={{background:"white",border:`1px solid ${T.border}`,borderRadius:12,padding:16,fontFamily:"monospace",fontSize:12,lineHeight:1.7,whiteSpace:"pre-wrap",marginBottom:12}}>{reply}</div>
          <CopyBtn u={u} text={reply}/>
        </Card>
      )}

      {/* Notiz */}
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:T.inkSoft,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>📝 {u.briefeNote}</div>
        <textarea value={notiz} onChange={e=>setNotiz(e.target.value)} onBlur={saveNotiz} placeholder={u.briefeNotePh}
          style={{width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,color:T.ink,outline:"none",resize:"vertical",minHeight:60,fontFamily:"inherit"}}/>
      </Card>

      {/* Aktionen */}
      <Btn onClick={toggleDone} variant={brief.erledigt ? "ghost" : "success"} icon={brief.erledigt ? "↻" : "✓"}>
        {brief.erledigt ? u.briefeMarkOpen : u.briefeMarkDone}
      </Btn>
      <Btn onClick={deleteBrief} variant="danger" icon="🗑️">{u.briefeDelete}</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BRIEFE TAB — Liste aller Briefe + Termine
// ═══════════════════════════════════════════════════════════════════════════
function BriefeTab({lang, profile, briefe, setBriefe}) {
  const u = getUI(lang);
  const [view, setView] = useState("list"); // "list" | "scan" | "detail"
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | open | done
  const [search, setSearch] = useState("");

  // Termine berechnen — alle offenen Briefe mit Frist
  const termine = useMemo(() => {
    return briefe
      .filter(b => !b.erledigt && b.frist)
      .map(b => ({...b, fristDate: parseFrist(b.frist), days: daysUntil(parseFrist(b.frist))}))
      .filter(b => b.fristDate)
      .sort((a,b) => a.days - b.days);
  }, [briefe]);

  const dringend = termine.filter(t => t.days <= 7);

  // Gefilterte Briefe-Liste
  const filtered = useMemo(() => {
    let list = [...briefe];
    if (filter === "open") list = list.filter(b => !b.erledigt);
    if (filter === "done") list = list.filter(b => b.erledigt);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.behoerde||"").toLowerCase().includes(q) ||
        (b.betreff||"").toLowerCase().includes(q) ||
        (b.notiz||"").toLowerCase().includes(q)
      );
    }
    // Sortierung: offene zuerst, dann nach Frist, dann nach Datum
    list.sort((a,b) => {
      if (a.erledigt !== b.erledigt) return a.erledigt ? 1 : -1;
      const aDate = parseFrist(a.frist), bDate = parseFrist(b.frist);
      if (aDate && bDate) return aDate - bDate;
      if (aDate) return -1;
      if (bDate) return 1;
      return new Date(b.savedAt) - new Date(a.savedAt);
    });
    return list;
  }, [briefe, filter, search]);

  if (view === "scan") {
    return <ScanView lang={lang} profile={profile} briefe={briefe} setBriefe={setBriefe}
      onClose={(newId)=>{
        if (newId) { setSelectedId(newId); setView("detail"); }
        else setView("list");
      }}/>;
  }

  if (view === "detail" && selectedId) {
    const brief = briefe.find(b => b.id === selectedId);
    if (!brief) { setView("list"); return null; }
    return <BriefDetail brief={brief} lang={lang} profile={profile} briefe={briefe} setBriefe={setBriefe}
      onBack={()=>setView("list")}/>;
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{fontSize:24,fontWeight:700,color:T.ink}}>📁 {u.briefeTitle}</h2>
        <span style={{fontSize:13,color:T.inkMute,fontWeight:600}}>{briefe.length}</span>
      </div>

      {/* Termine-Übersicht oben */}
      {dringend.length > 0 && (
        <div style={{background:"linear-gradient(135deg, #FEF2F2, #FEE2E2)",border:`2px solid ${T.danger}`,borderRadius:16,padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:22}}>⚠️</span>
            <div style={{fontSize:15,fontWeight:800,color:"#991B1B"}}>
              {dringend.length === 1 ? "1 dringende Frist!" : `${dringend.length} dringende Fristen!`}
            </div>
          </div>
          {dringend.slice(0,3).map(t => (
            <div key={t.id} onClick={()=>{setSelectedId(t.id);setView("detail");}}
              style={{background:"white",borderRadius:10,padding:"10px 12px",marginTop:6,cursor:"pointer",border:`1px solid #FCA5A5`,fontSize:13}}>
              <div style={{fontWeight:700,color:T.ink,marginBottom:2}}>{t.behoerde}</div>
              <div style={{color:T.danger,fontWeight:600,fontSize:12}}>
                {t.days < 0 ? `⚠️ ${Math.abs(t.days)} Tage überfällig` :
                 t.days === 0 ? "❗ HEUTE!" :
                 t.days === 1 ? "❗ Morgen!" : `🔴 in ${t.days} Tagen`} — {t.frist}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suche + Filter */}
      {briefe.length > 0 && (
        <>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`🔍 ${u.briefeSearch}`}
            style={{width:"100%",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"12px 16px",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          <div style={{display:"flex",gap:6}}>
            {[
              {id:"all", label:u.briefeFilterAll},
              {id:"open", label:u.briefeFilterOpen},
              {id:"done", label:u.briefeFilterDone},
            ].map(f => (
              <button key={f.id} onClick={()=>setFilter(f.id)}
                style={{flex:1,background:filter===f.id?T.brand:T.surface,color:filter===f.id?"white":T.inkSoft,border:filter===f.id?"none":`1px solid ${T.border}`,borderRadius:10,padding:"10px 8px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Briefe-Liste */}
      {filtered.length === 0 && briefe.length === 0 && (
        <Card>
          <div style={{textAlign:"center",padding:"30px 10px"}}>
            <div style={{fontSize:48,marginBottom:14,opacity:0.5}}>📭</div>
            <div style={{fontSize:16,fontWeight:600,color:T.ink,marginBottom:6}}>{u.briefeEmpty}</div>
            <div style={{fontSize:13,color:T.inkMute,lineHeight:1.5}}>{u.briefeEmptySub}</div>
          </div>
        </Card>
      )}
      {filtered.length === 0 && briefe.length > 0 && (
        <Card>
          <div style={{textAlign:"center",padding:"20px 10px",color:T.inkMute,fontSize:14}}>
            Keine Briefe gefunden
          </div>
        </Card>
      )}
      {filtered.map(brief => {
        const urg = getUrgencyColor(brief, T);
        return (
          <button key={brief.id} onClick={()=>{setSelectedId(brief.id);setView("detail");}}
            style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",flexDirection:"column",gap:6,opacity:brief.erledigt?0.6:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {brief.erledigt && "✓ "}{brief.behoerde}
                </div>
                <div style={{fontSize:13,color:T.inkSoft,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{brief.betreff}</div>
              </div>
              <span style={{display:"inline-flex",background:urg.bg,color:urg.color,padding:"4px 9px",borderRadius:7,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{urg.label}</span>
            </div>
            {brief.frist && <div style={{fontSize:12,color:T.inkMute}}>⏰ Frist: {brief.frist}</div>}
            {brief.notiz && <div style={{fontSize:12,color:T.inkMute,fontStyle:"italic"}}>📝 {brief.notiz.substring(0,60)}{brief.notiz.length>60?"...":""}</div>}
          </button>
        );
      })}

      {/* Neuer Brief Button */}
      <Btn onClick={()=>setView("scan")} variant="accent" icon="📷" style={{marginTop:8}}>
        {u.briefeNew}
      </Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT TAB
// ═══════════════════════════════════════════════════════════════════════════
function ChatTab({lang, prefilledContext, profile}) {
  const ln = getLang(lang); const u = getUI(lang);
  const profileText = profileToText(profile);
  const SYS = `Du bist ein freundlicher Helfer für Ausländer in Deutschland. Antworte auf ${ln.label} — kurze klare Sätze. Briefe immer auf PERFEKTEM DEUTSCH mit korrektem Briefkopf.${profileText ? `\n\nDaten des Users:\n${profileText}` : ""}`;

  const initialMsg = prefilledContext
    ? {role:"assistant",content:prefilledContext.greeting,intro:true}
    : {role:"assistant",content:u.chatHello,intro:true};
  const [msgs,setMsgs]=useState([initialMsg]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [showQ,setShowQ]=useState(true);
  const bottomRef=useRef();

  async function send(text){
    const msg=text||input; if(!msg.trim()||loading)return;
    setInput(""); setShowQ(false);
    const nm=[...msgs,{role:"user",content:msg}]; setMsgs(nm); setLoading(true);
    try{
      const r=await callClaude(nm.filter(m=>!m.intro).map(m=>({role:m.role,content:m.content})),SYS,1400,"claude-haiku-4-5-20251001");
      setMsgs([...nm,{role:"assistant",content:r}]);
    }catch(e){setMsgs([...nm,{role:"assistant",content:u.chatError+": "+e.message}]);}
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
  }

  const quick = [
    {icon:"✍️",label:"Antwort\nschreiben",prompt:"Ich habe einen Brief und brauche eine Antwort"},
    {icon:"💶",label:"Bürgergeld\nbeantragen",prompt:"Ich möchte Bürgergeld beantragen"},
    {icon:"⚖️",label:"Widerspruch",prompt:"Widerspruch einlegen"},
    {icon:"👶",label:"Kindergeld",prompt:"Ich möchte Kindergeld beantragen"},
    {icon:"🪪",label:"Aufenthalts-\ntitel",prompt:"Aufenthaltstitel verlängern"},
    {icon:"📊",label:"Steuer-\nerklärung",prompt:"Steuererklärung machen"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {profile?.name && (
        <div style={{background:"linear-gradient(135deg, #ECFDF5, #D1FAE5)",border:`1.5px solid ${T.success}`,borderRadius:12,padding:"10px 14px",fontSize:12,color:"#065F46",fontWeight:600,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🔒</span>
          <div style={{flex:1,lineHeight:1.4}}>
            <div style={{fontWeight:700}}>Profil aktiv: {profile.name}</div>
            <div style={{fontSize:11,opacity:0.85}}>Daten auf Ihrem Handy — sicher!</div>
          </div>
        </div>
      )}

      {showQ && (
        <Card>
          <div style={{fontSize:18,fontWeight:700,color:T.ink,marginBottom:16}}>{u.chatWhat}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {quick.map(a => (
              <button key={a.label} onClick={()=>send(a.prompt)} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 10px",cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
                <div style={{fontSize:24,marginBottom:6}}>{a.icon}</div>
                <div style={{fontSize:12,fontWeight:600,color:T.ink,lineHeight:1.3,whiteSpace:"pre"}}>{a.label}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,maxHeight:420,overflowY:"auto",padding:16}}>
          {msgs.map((m,i) => (
            <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%",background:m.role==="user"?T.brand:T.surfaceAlt,color:m.role==="user"?"white":T.ink,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 14px",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>
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
        <div style={{borderTop:`1px solid ${T.border}`,padding:12,display:"flex",gap:8,alignItems:"flex-end",background:T.surfaceAlt}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={u.chatPlaceholder}
            style={{flex:1,background:"white",border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontFamily:"inherit",fontSize:14,outline:"none",resize:"none",height:42}}/>
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{width:42,height:42,background:T.brand,color:"white",border:"none",borderRadius:10,fontSize:16,cursor:"pointer",opacity:loading||!input.trim()?.4:1}}>↑</button>
        </div>
      </Card>
      {!showQ && <Btn onClick={()=>setShowQ(true)} variant="ghost">{u.chatBack}</Btn>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMS TAB
// ═══════════════════════════════════════════════════════════════════════════
function FormsTab({lang, profile}) {
  const ln=getLang(lang); const u=getUI(lang);
  const [sel,setSel]=useState(null); const [qs,setQs]=useState([]); const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({}); const [curAns,setCurAns]=useState("");
  const [result,setResult]=useState(""); const [loading,setLoading]=useState(false);

  const forms = [
    {id:"buergergeld",label:"Bürgergeld",icon:"💶",bg:"#FEF3C7"},
    {id:"widerspruch",label:"Widerspruch",icon:"⚖️",bg:"#FEE2E2"},
    {id:"kindergeld",label:"Kindergeld",icon:"👶",bg:"#FCE7F3"},
    {id:"anmeldung",label:"Anmeldung",icon:"🏠",bg:"#EDE9FE"},
    {id:"aufenthalt",label:"Aufenthaltstitel",icon:"🪪",bg:"#FFEDD5"},
    {id:"steuer",label:"Steuererklärung",icon:"📊",bg:"#DBEAFE"},
  ];

  async function startForm(form){
    setSel(form); setStep(0); setAnswers({}); setResult(""); setQs([]); setLoading(true);
    const profileText = profileToText(profile);
    const profileHint = profileText ? `\n\nDer User hat bereits diese Daten gespeichert (NICHT nochmal fragen):\n${profileText}\n\nFrage NUR nach Daten die FEHLEN!` : "";
    try{
      const raw=await callClaude([{role:"user",content:`Formular: "${form.label}". Stelle 3-5 EINFACHE Fragen auf ${ln.label} — nur die WICHTIGSTEN.${profileHint}\n\nNUR JSON Array:\n[{"id":"q0","frage":"Frage","beispiel":"Beispiel","pflicht":true}]`}],"NUR JSON.",600,"claude-haiku-4-5-20251001");
      setQs(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch{setQs([{id:"q0",frage:"Worum geht es genau?",beispiel:"z.B. neuer Antrag",pflicht:true}]);}
    setLoading(false);
  }

  async function nextStep(){
    const na={...answers,[qs[step].id]:curAns}; setAnswers(na); setCurAns("");
    if(step+1>=qs.length){
      setLoading(true);
      const txt=qs.map(q=>`${q.frage}: ${na[q.id]||"—"}`).join("\n");
      const profileText = profileToText(profile);
      const sys = `Du bist Experte für deutsche Behördenformulare. Erstelle einen formellen, kompletten Antrag auf perfektem Deutsch mit Briefkopf.${profileText ? `\n\nABSENDER:\n${profileText}` : ""}`;
      try{
        const r=await callClaude([{role:"user",content:`Erstelle deutschen Antrag für "${sel.label}".\n\nAngaben:\n${txt}`}],sys,1500);
        setResult(r);
      }catch(e){setResult("Fehler: "+e.message);}
      setLoading(false);
    }else{setStep(step+1);}
  }

  if(!sel) return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{fontSize:24,fontWeight:700,color:T.ink}}>📋 Welches Formular?</h2>
      {!profile?.name && (
        <div style={{background:T.warningL,border:`1.5px solid ${T.warning}`,borderRadius:12,padding:"12px 16px",fontSize:13,color:"#78350F"}}>{u.profileNoData}</div>
      )}
      {profile?.name && (
        <div style={{background:"linear-gradient(135deg, #ECFDF5, #D1FAE5)",border:`1.5px solid ${T.success}`,borderRadius:12,padding:"10px 14px",fontSize:12,color:"#065F46",fontWeight:600,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>🔒</span>
          <div style={{flex:1,lineHeight:1.4}}>
            <div style={{fontWeight:700}}>Daten von {profile.name} werden verwendet</div>
            <div style={{fontSize:11,opacity:0.85}}>Auf Ihrem Handy gespeichert — privat!</div>
          </div>
        </div>
      )}
      {forms.map(f => (
        <button key={f.id} onClick={()=>startForm(f)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",fontFamily:"inherit"}}>
          <div style={{width:46,height:46,background:f.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{f.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:600,color:T.ink}}>{f.label}</div>
          </div>
          <div style={{fontSize:18,color:T.inkMute}}>›</div>
        </button>
      ))}
    </div>
  );

  if(result) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"linear-gradient(135deg,#10B981,#059669)",borderRadius:18,padding:"24px 18px",color:"white",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:6}}>✓</div>
        <div style={{fontSize:18,fontWeight:700}}>{sel.label}</div>
        <div style={{fontSize:13,opacity:0.9,marginTop:4}}>Fertig!</div>
      </div>
      <Card>
        <div style={{background:T.surfaceAlt,borderRadius:10,padding:14,fontFamily:"monospace",fontSize:11,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{result}</div>
      </Card>
      <CopyBtn u={u} text={result}/>
      <Btn onClick={()=>{setSel(null);setResult("");setStep(0);}} variant="ghost" icon="↻">Anderes Formular</Btn>
    </div>
  );

  if(loading) return <Card><Spinner text={qs.length===0?"Wird vorbereitet...":"Wird erstellt..."}/></Card>;
  if(qs.length===0) return <Card><Spinner text="Wird vorbereitet..."/></Card>;
  const q=qs[step]; const pct=Math.round((step/qs.length)*100);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <button onClick={()=>setSel(null)} style={{background:T.borderL,border:"none",borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:16,color:T.inkSoft}}>←</button>
          <div style={{width:38,height:38,background:sel.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{sel.icon}</div>
          <div style={{fontSize:15,fontWeight:600,color:T.ink}}>{sel.label}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.inkSoft,marginBottom:6}}>
          <span>{step+1} / {qs.length}</span>
          <span style={{color:T.accent,fontWeight:700}}>{pct}%</span>
        </div>
        <div style={{height:5,background:T.borderL,borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.accent},${T.accent2})`,borderRadius:3,transition:"width 400ms"}}/>
        </div>
      </Card>

      <Card>
        <div style={{fontSize:11,fontWeight:600,color:q.pflicht?T.danger:T.inkMute,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>{q.pflicht?"Pflicht":"Optional"}</div>
        <div style={{fontSize:20,fontWeight:700,color:T.ink,marginBottom:8,lineHeight:1.3}}>{q.frage}</div>
        {q.beispiel && <div style={{fontSize:13,color:T.inkMute,marginBottom:14}}>z.B.: {q.beispiel}</div>}
        <textarea autoFocus value={curAns} onChange={e=>setCurAns(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();nextStep();}}}
          style={{width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",fontFamily:"inherit",fontSize:15,outline:"none",resize:"none",minHeight:80}}/>
      </Card>

      <Btn onClick={nextStep} disabled={q.pflicht&&!curAns.trim()} icon={step+1>=qs.length?"✓":"→"}>
        {step+1>=qs.length?"Erstellen":"Weiter"}
      </Btn>
      {!q.pflicht && (
        <button onClick={()=>{setCurAns("");nextStep();}} style={{background:"none",border:"none",color:T.inkMute,cursor:"pointer",fontSize:13,textDecoration:"underline",fontFamily:"inherit"}}>Überspringen</button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,setTab] = useState("briefe");
  const [lang,setLang] = useState("de");
  const [showLP,setShowLP] = useState(false);
  const [chatContext,setChatContext] = useState(null);
  const [profile, setProfile] = useState(null);
  const [briefe, setBriefe] = useState([]);

  // Lade Profil + Briefe beim Start
  useEffect(() => {
    setProfile(loadProfile());
    setBriefe(loadBriefe());
  }, []);

  const ln = getLang(lang); const u = getUI(lang);

  function handleBehoerdeBrief(beh, stadt, bundesland) {
    setChatContext({greeting:`👋 Sie möchten an die ${beh.name} in ${stadt}${bundesland?`, ${bundesland}`:""} schreiben?\n\nWas ist Ihr Anliegen?`});
    setTab("chat");
  }

  // Anzahl dringender Termine für Badge
  const dringendCount = useMemo(() => {
    return briefe.filter(b => {
      if (b.erledigt || !b.frist) return false;
      const days = daysUntil(parseFrist(b.frist));
      return days !== null && days <= 7;
    }).length;
  }, [briefe]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter Tight',sans-serif",maxWidth:520,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};font-family:'Inter Tight',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        button:active{transform:scale(0.97)}
        input:focus,textarea:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px ${T.accent}22!important}
      `}</style>

      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:T.brand,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🇩🇪</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Behörden Assistent</div>
            <div style={{fontSize:10,color:T.inkMute}}>{u.appSub}</div>
          </div>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLP(!showLP)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 11px",fontSize:13,fontWeight:600,color:T.ink,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>
            {ln.flag} <span>{ln.label}</span> ▾
          </button>
          {showLP && (
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:6,zIndex:200,minWidth:180,boxShadow:"0 12px 40px rgba(0,0,0,0.12)",maxHeight:340,overflowY:"auto"}}>
              {LANGS.map(l => (
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLP(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:lang===l.code?T.borderL:"transparent",border:"none",borderRadius:8,padding:"10px 12px",color:T.ink,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:lang===l.code?700:500}}>
                  <span style={{fontSize:18}}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",padding:"8px 6px 10px",display:"flex",gap:3,position:"sticky",top:62,zIndex:90,borderBottom:`1px solid ${T.border}`}}>
        {[
          {id:"briefe",icon:"📁",label:u.tab1, badge: dringendCount},
          {id:"chat",icon:"✨",label:u.tab2},
          {id:"forms",icon:"📋",label:u.tab3},
          {id:"laender",icon:"📍",label:u.tab4},
          {id:"profile",icon:"👤",label:u.tab5},
        ].map(t => (
          <button key={t.id} onClick={()=>{setTab(t.id);if(t.id!=="chat")setChatContext(null);}}
            style={{flex:1,background:tab===t.id?T.brand:T.surface,border:tab===t.id?"none":`1px solid ${T.border}`,borderRadius:9,padding:"7px 2px",cursor:"pointer",fontSize:9.5,fontWeight:tab===t.id?700:600,color:tab===t.id?"white":T.inkSoft,display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"inherit",transition:"all 200ms",boxShadow:tab===t.id?"0 4px 14px rgba(15,23,42,0.22)":"none",position:"relative"}}>
            <span style={{fontSize:15}}>{t.icon}</span>{t.label}
            {t.badge > 0 && (
              <span style={{position:"absolute",top:2,right:2,background:T.danger,color:"white",borderRadius:"50%",minWidth:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{padding:"14px 12px 80px"}}>
        {tab==="briefe"&& <BriefeTab lang={lang} profile={profile} briefe={briefe} setBriefe={setBriefe}/>}
        {tab==="chat"  && <ChatTab lang={lang} prefilledContext={chatContext} profile={profile}/>}
        {tab==="forms" && <FormsTab lang={lang} profile={profile}/>}
        {tab==="laender"&& <BundeslandDatenbank onSelectBehoerde={handleBehoerdeBrief}/>}
        {tab==="profile"&& <ProfileTab profile={profile} setProfile={setProfile} lang={lang}/>}
      </div>

      <div style={{textAlign:"center",padding:"10px 14px",color:T.inkMute,fontSize:10,background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",borderTop:`1px solid ${T.border}`,position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520}}>
        {u.footer}
      </div>
    </div>
  );
}
