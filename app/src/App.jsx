import { useState, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const LANGS = [
  { code:"ar", label:"العربية", flag:"🇸🇦", dir:"rtl" },
  { code:"tr", label:"Türkçe",  flag:"🇹🇷", dir:"ltr" },
  { code:"uk", label:"Українська", flag:"🇺🇦", dir:"ltr" },
  { code:"ru", label:"Русский", flag:"🇷🇺", dir:"ltr" },
  { code:"fa", label:"فارسی",   flag:"🇮🇷", dir:"rtl" },
  { code:"en", label:"English", flag:"🇬🇧", dir:"ltr" },
  { code:"fr", label:"Français",flag:"🇫🇷", dir:"ltr" },
  { code:"es", label:"Español", flag:"🇪🇸", dir:"ltr" },
  { code:"vi", label:"Tiếng Việt", flag:"🇻🇳", dir:"ltr" },
];

const BEHOERDEN = [
  { id:"auslaenderamt",  name:"Ausländerbehörde",     icon:"🏛️", desc:"Aufenthaltstitel, Visa, Niederlassungserlaubnis", color:"#dbeafe" },
  { id:"jobcenter",      name:"Jobcenter",             icon:"💼", desc:"Bürgergeld, Arbeitslosengeld, Vermittlung",       color:"#fef3c7" },
  { id:"finanzamt",      name:"Finanzamt",             icon:"📊", desc:"Steuern, Steuerklasse, Steuererklärung",         color:"#d1fae5" },
  { id:"standesamt",     name:"Standesamt",            icon:"📋", desc:"Geburtsurkunden, Heirat, Meldung",               color:"#ede9fe" },
  { id:"familienkasse",  name:"Familienkasse",         icon:"👶", desc:"Kindergeld, Elterngeld, Beihilfen",              color:"#fce7f3" },
  { id:"krankenkasse",   name:"Krankenversicherung",   icon:"🏥", desc:"AOK, TK, Barmer – Anträge & Widerspruch",        color:"#ffedd5" },
];

const FORMS = [
  { id:"buergergeld",    label:"Bürgergeld Antrag",           icon:"💶", bg:"#fef3c7", behoerde:"Jobcenter" },
  { id:"widerspruch",    label:"Widerspruch einlegen",        icon:"⚖️", bg:"#fee2e2", behoerde:"Beliebige Behörde" },
  { id:"steuer",         label:"Steuererklärung (einfach)",   icon:"📊", bg:"#dbeafe", behoerde:"Finanzamt" },
  { id:"kindergeld",     label:"Kindergeld Antrag",           icon:"👶", bg:"#fce7f3", behoerde:"Familienkasse" },
  { id:"anmeldung",      label:"Anmeldung / Ummeldung",       icon:"🏠", bg:"#ede9fe", behoerde:"Einwohnermeldeamt" },
  { id:"aufenthalt",     label:"Aufenthaltstitel verlängern", icon:"🪪", bg:"#ffedd5", behoerde:"Ausländerbehörde" },
];

const CHAT_CHIPS = [
  { label:"✍️ Antwortbrief",   prompt:"Ich habe einen Brief von einer deutschen Behörde bekommen und möchte einen Antwortbrief schreiben. Hilf mir bitte." },
  { label:"💶 Bürgergeld",     prompt:"Ich möchte Bürgergeld beantragen. Führe mich bitte Schritt für Schritt durch den Antrag." },
  { label:"⚖️ Widerspruch",    prompt:"Ich möchte Widerspruch gegen einen Bescheid einlegen. Hilf mir einen Widerspruchsbrief zu schreiben." },
  { label:"📊 Steuererklärung",prompt:"Ich muss eine Steuererklärung machen. Hilf mir dabei Schritt für Schritt." },
  { label:"👶 Kindergeld",     prompt:"Ich möchte Kindergeld beantragen. Führe mich durch das Formular." },
  { label:"🪪 Aufenthaltstitel",prompt:"Ich muss meinen Aufenthaltstitel verlängern. Was brauche ich und wie läuft das ab?" },
];

const LETTER_TYPES = [
  "Antrag stellen","Widerspruch einlegen","Termin anfragen",
  "Dokumente nachreichen","Adressänderung melden","Frist verlängern","Bescheid anfechten",
];

// ─── API ─────────────────────────────────────────────────────────────────────
async function claude(messages, system, maxTokens = 1200) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, system, messages }),
  });
  if (!r.ok) throw new Error(`Fehler ${r.status}`);
  const d = await r.json();
  return d.content?.map(c => c.text || "").join("") || "";
}

function toB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function mtype(f) { return f.type==="image/png"?"image/png":f.type==="image/webp"?"image/webp":"image/jpeg"; }
function langName(code) { return LANGS.find(l=>l.code===code)?.label||code; }
function langDir(code)  { return LANGS.find(l=>l.code===code)?.dir||"ltr"; }

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg:"#f0f4f8", white:"#ffffff", border:"#e2e8f0",
  primary:"#1a56db", primaryL:"#eff6ff", primaryD:"#1e40af",
  text:"#1e293b", text2:"#475569", text3:"#94a3b8",
  green:"#059669", greenL:"#d1fae5",
  red:"#dc2626",   redL:"#fee2e2",
  gold:"#d97706",  goldL:"#fef3c7",
  purple:"#7c3aed",purpleL:"#ede9fe",
  orange:"#ea580c",orangeL:"#ffedd5",
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const css = {
  box: { background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"1rem", boxShadow:"0 1px 3px rgba(0,0,0,.07)" },
  inp: { width:"100%", background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:8, padding:".6rem .85rem", fontFamily:"inherit", fontSize:".82rem", color:C.text, outline:"none" },
  btn: { width:"100%", padding:".75rem 1rem", border:"none", borderRadius:8, fontFamily:"inherit", fontSize:".85rem", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:".4rem" },
};

function Box({ children, style={}, accent }) {
  return <div style={{ ...css.box, ...(accent?{border:`1.5px solid ${accent}`}:{}), ...style }}>{children}</div>;
}
function BoxHeader({ icon, iconBg="#dbeafe", title, sub, right }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:".75rem" }}>
      <div style={{ width:34, height:34, borderRadius:8, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:".82rem", fontWeight:700, color:C.text }}>{title}</div>
        {sub && <div style={{ fontSize:".62rem", color:C.text3, fontWeight:500 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
function Btn({ children, onClick, disabled, variant="primary", style={} }) {
  const styles = {
    primary: { background:disabled?"#cbd5e1":`linear-gradient(135deg,${C.primary},#3b82f6)`, color:disabled?C.text3:"white", boxShadow:disabled?"none":"0 4px 12px rgba(26,86,219,.25)" },
    ghost:   { background:C.bg, color:C.text2, border:`1px solid ${C.border}` },
    danger:  { background:C.redL, color:C.red, border:`1px solid #fca5a5` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...css.btn, ...styles[variant], ...style }}>{children}</button>;
}
function Badge({ children, color, bg, border }) {
  return <span style={{ background:bg, color, border:`1px solid ${border}`, borderRadius:20, padding:".2rem .6rem", fontSize:".62rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:".25rem", whiteSpace:"nowrap" }}>{children}</span>;
}
function Inp({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize:".7rem", fontWeight:600, color:C.text2, display:"block", marginBottom:3 }}>{label}</label>}
      <input style={css.inp} {...props}/>
    </div>
  );
}
function Sel({ label, children, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize:".7rem", fontWeight:600, color:C.text2, display:"block", marginBottom:3 }}>{label}</label>}
      <select style={{ ...css.inp, appearance:"none", cursor:"pointer" }} {...props}>{children}</select>
    </div>
  );
}
function Spinner({ label="Einen Moment..." }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:".6rem", padding:"1.5rem" }}>
      <div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTop:`3px solid ${C.primary}`, borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
      <span style={{ fontSize:".72rem", color:C.text3, fontWeight:500 }}>{label}</span>
    </div>
  );
}
function Disclaimer({ onClose }) {
  return (
    <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:".65rem .85rem", display:"flex", gap:".5rem", alignItems:"flex-start" }}>
      <span style={{ fontSize:".9rem" }}>⚠️</span>
      <span style={{ fontSize:".65rem", color:"#92400e", lineHeight:1.5, flex:1 }}>
        <strong>Hinweis:</strong> KI-Assistent — kein Ersatz für Rechtsberatung. Briefe vor dem Absenden prüfen.
      </span>
      {onClose && <button onClick={onClose} style={{ background:"none", border:"none", color:"#92400e", cursor:"pointer", fontSize:".9rem", flexShrink:0, padding:0 }}>×</button>}
    </div>
  );
}
function LetterCard({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div style={{ background:"#fffbeb", border:"1.5px solid #fde68a", borderRadius:10, padding:"1rem 1rem 1rem 1.25rem", position:"relative", borderLeft:`4px solid ${C.gold}` }}>
      <button onClick={copy} style={{ position:"absolute", top:8, right:8, background:copied?"#d1fae5":C.white, border:`1px solid ${copied?"#6ee7b7":C.border}`, borderRadius:6, padding:".22rem .5rem", fontSize:".62rem", fontWeight:600, color:copied?C.green:C.text2, cursor:"pointer", fontFamily:"inherit" }}>
        {copied?"✓ Kopiert!":"📋 Kopieren"}
      </button>
      <pre style={{ fontFamily:"'Courier New',monospace", fontSize:".72rem", lineHeight:1.85, color:"#1c1917", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{text}</pre>
    </div>
  );
}
function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:".35rem 0", borderBottom:`1px solid ${C.bg}` }}>
      <span style={{ fontSize:".65rem", color:C.text3, fontWeight:600 }}>{label}</span>
      <span style={{ fontSize:".7rem", color:valueColor||C.text, fontWeight:600 }}>{value}</span>
    </div>
  );
}

// ─── TAB: SCAN ───────────────────────────────────────────────────────────────
function ScanTab({ lang }) {
  const [imgB64, setImgB64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [showDisc, setShowDisc] = useState(true);
  const fileRef = useRef(); const camRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) { setError("Nur Bilder erlaubt (JPG, PNG, WEBP)"); return; }
    setError(""); setResult(null); setReply("");
    setPreview(URL.createObjectURL(file));
    setMediaType(mtype(file));
    setImgB64(await toB64(file));
  }, []);

  async function analyze() {
    setLoading(true); setResult(null); setReply("");
    const ln = langName(lang);
    try {
      const raw = await claude([{ role:"user", content:[
        { type:"image", source:{ type:"base64", media_type:mediaType, data:imgB64 } },
        { type:"text",  text:`Analysiere diesen deutschen Behördenbrief. Antworte NUR mit reinem JSON:\n{"behoerde":"...","betreff":"...","datum":"...","dringlichkeit":"hoch|mittel|niedrig","frist":"...oder null","uebersetzung":"Vollständige Übersetzung auf ${ln}","erklaerung":"Einfache Erklärung auf ${ln}","naechste_schritte":["Schritt 1 auf ${ln}","Schritt 2"],"originaltext":"Extrahierter Text"}` }
      ]}], "Du bist OCR-Experte für deutsche Behördenbriefe. NUR reines JSON ohne Backticks.", 1500);
      setResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setError("Analyse fehlgeschlagen. Bitte deutlicheres Foto verwenden."); }
    setLoading(false);
  }

  async function genReply() {
    setReplyLoading(true); setReply("");
    const r = await claude([{ role:"user", content:`Schreibe professionellen deutschen Antwortbrief.\nBehörde: ${result.behoerde}\nBetreff: ${result.betreff}\nOriginaltext: ${result.originaltext}\n\nVollständiger Brief mit: Absender-Platzhalter, Datum ${new Date().toLocaleDateString("de-DE")}, Empfänger, Betreff, Anrede, Text, Grußformel.` }],
      `Experte für deutsche Behördenbriefe. Erstelle vollständige, formell korrekte Briefe. Danach kurze Erklärung auf ${langName(lang)}.`, 1200);
    setReply(r); setReplyLoading(false);
  }

  const reset = () => { setPreview(null); setImgB64(null); setResult(null); setReply(""); setError(""); };
  const uc = { hoch:"#dc2626", mittel:"#d97706", niedrig:"#059669" };
  const ul = { hoch:"⚠️ Dringend", mittel:"📌 Wichtig", niedrig:"✅ Normal" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      {showDisc && <Disclaimer onClose={()=>setShowDisc(false)}/>}
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>

      {/* Upload */}
      {!preview && (
        <Box>
          <div onClick={()=>fileRef.current.click()} style={{ background:C.bg, border:`2px dashed ${C.border}`, borderRadius:10, padding:"2rem 1rem", textAlign:"center", cursor:"pointer" }}
            onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} onDragOver={e=>e.preventDefault()}>
            <div style={{ fontSize:"2.5rem", marginBottom:".5rem" }}>📄</div>
            <div style={{ fontSize:".9rem", fontWeight:700, color:C.text, marginBottom:".25rem" }}>Brief fotografieren oder hochladen</div>
            <div style={{ fontSize:".72rem", color:C.text3, marginBottom:"1rem" }}>Tippen Sie hier oder ziehen Sie ein Bild rein</div>
            <div style={{ display:"flex", gap:".6rem", justifyContent:"center" }}>
              {[["📷 Kamera",()=>camRef.current.click()],["🖼️ Galerie",()=>fileRef.current.click()]].map(([lbl,fn])=>(
                <button key={lbl} onClick={e=>{e.stopPropagation();fn();}} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:8, padding:".45rem .9rem", fontSize:".78rem", fontWeight:600, color:C.text2, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 1px 3px rgba(0,0,0,.07)" }}>{lbl}</button>
              ))}
            </div>
          </div>
        </Box>
      )}

      {/* Preview */}
      {preview && !result && (
        <Box>
          <BoxHeader icon="🖼️" iconBg="#f1f5f9" title="Brief-Foto" sub="Bereit zur Analyse"
            right={<button onClick={reset} style={{ background:C.redL, border:`1px solid #fca5a5`, borderRadius:6, padding:".25rem .55rem", color:C.red, cursor:"pointer", fontSize:".65rem", fontWeight:700, fontFamily:"inherit" }}>✕ Neu</button>}/>
          <img src={preview} alt="Brief" style={{ width:"100%", borderRadius:8, border:`1px solid ${C.border}`, maxHeight:200, objectFit:"contain", background:C.bg }}/>
          {error && <div style={{ color:C.red, fontSize:".75rem", marginTop:".5rem", textAlign:"center" }}>{error}</div>}
          {!loading && <div style={{ marginTop:".75rem" }}><Btn onClick={analyze}>🔍 Brief analysieren &amp; übersetzen</Btn></div>}
          {loading && <Spinner label="KI liest und analysiert den Brief..."/>}
        </Box>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Header Box */}
          <Box accent={uc[result.dringlichkeit]}>
            <BoxHeader icon="🏛️" iconBg={`${uc[result.dringlichkeit]}22`} title={result.behoerde||"Behörde"} sub={result.datum}
              right={<Badge color={uc[result.dringlichkeit]} bg={`${uc[result.dringlichkeit]}18`} border={`${uc[result.dringlichkeit]}55`}>{ul[result.dringlichkeit]||"📌 Wichtig"}</Badge>}/>
            <InfoRow label="Betreff" value={result.betreff}/>
            {result.frist && <InfoRow label="⏰ Frist" value={result.frist} valueColor={C.red}/>}
          </Box>

          {/* Übersetzung */}
          <Box style={{ background:"linear-gradient(135deg,#eff6ff,#f0f9ff)", border:`1.5px solid #bfdbfe` }}>
            <BoxHeader icon="🌐" iconBg="#dbeafe" title="Übersetzung" sub={langName(lang)}/>
            <div style={{ fontSize:".8rem", color:"#1e3a5e", lineHeight:1.75, direction:langDir(lang), textAlign:langDir(lang)==="rtl"?"right":"left" }}>{result.uebersetzung}</div>
          </Box>

          {/* Erklärung */}
          <Box style={{ background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)", border:`1.5px solid #6ee7b7` }}>
            <BoxHeader icon="💡" iconBg={C.greenL} title="Erklärung" sub={langName(lang)}/>
            <div style={{ fontSize:".8rem", color:"#064e3b", lineHeight:1.75, direction:langDir(lang), textAlign:langDir(lang)==="rtl"?"right":"left" }}>{result.erklaerung}</div>
          </Box>

          {/* Schritte */}
          {result.naechste_schritte?.length > 0 && (
            <Box style={{ background:"linear-gradient(135deg,#faf5ff,#f5f3ff)", border:`1.5px solid #c4b5fd` }}>
              <BoxHeader icon="📋" iconBg={C.purpleL} title="Was jetzt tun?" sub={langName(lang)}/>
              {result.naechste_schritte.map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:".6rem", alignItems:"flex-start", marginBottom:".5rem" }}>
                  <div style={{ width:22, height:22, minWidth:22, background:C.purple, color:"white", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".62rem", fontWeight:800 }}>{i+1}</div>
                  <div style={{ fontSize:".78rem", color:"#4c1d95", lineHeight:1.55, paddingTop:2, direction:langDir(lang) }}>{s}</div>
                </div>
              ))}
            </Box>
          )}

          {/* Antwortbrief */}
          <Box>
            <BoxHeader icon="✉️" iconBg={C.goldL} title="Antwortbrief erstellen" sub="Fertiger Brief auf Deutsch"/>
            {!reply && !replyLoading && <Btn onClick={genReply}>✍️ Antwortbrief auf Deutsch schreiben</Btn>}
            {replyLoading && <Spinner label="Schreibe Antwortbrief..."/>}
            {reply && <LetterCard text={reply}/>}
          </Box>

          {/* Original */}
          {result.originaltext && (
            <details style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:".75rem 1rem" }}>
              <summary style={{ color:C.text3, fontSize:".75rem", cursor:"pointer", fontWeight:600 }}>📝 Originaltext anzeigen</summary>
              <div style={{ color:C.text3, fontSize:".72rem", lineHeight:1.7, marginTop:".75rem", whiteSpace:"pre-wrap" }}>{result.originaltext}</div>
            </details>
          )}

          <Btn variant="ghost" onClick={reset}>📷 Neuen Brief scannen</Btn>
        </>
      )}
    </div>
  );
}

// ─── TAB: CHAT ───────────────────────────────────────────────────────────────
function ChatTab({ lang }) {
  const ln = langName(lang);
  const SYSTEM = `Du bist ein geduldiger, einfühlsamer KI-Assistent für Ausländer in Deutschland. Du hilfst bei:
- Antwortbriefe auf Behördenbriefe schreiben (immer auf PERFEKTEM DEUTSCH, vollständig formatiert mit Briefkopf)
- Formulare ausfüllen: Bürgergeld, Kindergeld, Steuererklärung, Aufenthaltstitel, Widerspruch
- Fragen zu deutschen Behörden beantworten

Methode: Stelle gezielte Fragen, führe Schritt für Schritt, dann erstelle fertigen deutschen Brief/Antrag.
Briefe immer auf PERFEKTEM DEUTSCH. Erklärungen auf ${ln}. Sei warm und ermutigend.
Weise immer darauf hin: KI-Brief vor Absenden prüfen.`;

  const [msgs, setMsgs] = useState([{ role:"assistant", content:`👋 Hallo! Ich bin Ihr persönlicher Behörden-Assistent.\n\nIch helfe Ihnen:\n✉️ Antwortbriefe auf Deutsch schreiben\n📝 Formulare ausfüllen\n🏛️ Behörden erklären\n\nWie kann ich Ihnen helfen?`, intro:true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef();

  async function send(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput(""); setShowChips(false);
    const userMsg = { role:"user", content:msg };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setLoading(true);
    try {
      const res = await claude(newMsgs.filter(m=>!m.intro).map(m=>({ role:m.role, content:m.content })), SYSTEM, 1400);
      setMsgs([...newMsgs, { role:"assistant", content:res }]);
    } catch {
      setMsgs([...newMsgs, { role:"assistant", content:"⚠️ Verbindungsfehler. Bitte versuchen Sie es erneut." }]);
    }
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 100);
  }

  function isLetter(txt) { return txt.includes("Sehr geehrte") || txt.includes("Mit freundlichen Grüßen"); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      <Box>
        <BoxHeader icon="🤖" iconBg="#dbeafe" title="KI Assistent" sub="Schreiben Sie auf Ihrer Sprache"
          right={<Badge color={C.green} bg={C.greenL} border="#6ee7b7">● Online</Badge>}/>

        {/* Messages */}
        <div style={{ display:"flex", flexDirection:"column", gap:".6rem", maxHeight:280, overflowY:"auto", marginBottom:".75rem" }}>
          {msgs.map((m,i) => {
            const hasLetter = m.role==="assistant" && isLetter(m.content);
            let explanation = m.content, letter = "";
            if (hasLetter) {
              const idx = m.content.indexOf("Sehr geehrte");
              if (idx > 40) { explanation = m.content.slice(0,idx).trim(); letter = m.content.slice(idx).trim(); }
              else { explanation = ""; letter = m.content; }
            }
            return (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start", gap:".2rem" }}>
                {m.role==="assistant" && <span style={{ fontSize:".58rem", color:C.text3, fontWeight:600, marginLeft:2 }}>🤖 Assistent</span>}
                {(explanation||!hasLetter) && (
                  <div style={{ maxWidth:"88%", padding:".65rem .9rem", fontSize:".78rem", lineHeight:1.6, whiteSpace:"pre-wrap",
                    background:m.role==="user"?C.primary:C.bg,
                    color:m.role==="user"?"white":C.text,
                    border:m.role==="user"?"none":`1px solid ${C.border}`,
                    borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                    direction:m.role==="user"?langDir(lang):"ltr"
                  }}>{explanation||m.content}</div>
                )}
                {hasLetter && letter && (
                  <div style={{ width:"96%" }}>
                    <div style={{ fontSize:".65rem", fontWeight:700, color:C.gold, marginBottom:".3rem" }}>📄 Fertiger Brief (Deutsch):</div>
                    <LetterCard text={letter}/>
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:".2rem" }}>
              <span style={{ fontSize:".58rem", color:C.text3, fontWeight:600, marginLeft:2 }}>🤖 Assistent</span>
              <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:"12px 12px 12px 3px", padding:".6rem .9rem", display:"flex", gap:5 }}>
                {[0,.2,.4].map(d=><span key={d} style={{ width:7, height:7, background:"#94a3b8", borderRadius:"50%", display:"block", animation:`bounce .8s ${d}s infinite` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Chips */}
        {showChips && (
          <div style={{ marginBottom:".75rem" }}>
            <div style={{ fontSize:".62rem", fontWeight:700, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:".4rem" }}>Schnellauswahl</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
              {CHAT_CHIPS.map(c=>(
                <button key={c.label} onClick={()=>send(c.prompt)} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:20, padding:".28rem .7rem", fontSize:".68rem", fontWeight:600, color:C.text2, cursor:"pointer", fontFamily:"inherit" }}>{c.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ display:"flex", gap:".4rem", alignItems:"flex-end", paddingTop:".5rem", borderTop:`1px solid ${C.border}` }}>
          <textarea
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Schreiben Sie auf Ihrer Sprache..."
            style={{ flex:1, ...css.inp, resize:"none", height:44, lineHeight:1.4, borderRadius:20, paddingLeft:"1rem" }}
            dir={langDir(lang)}
          />
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ width:44, height:44, background:`linear-gradient(135deg,${C.primary},#3b82f6)`, color:"white", border:"none", borderRadius:"50%", fontSize:"1.1rem", cursor:"pointer", flexShrink:0, opacity:loading||!input.trim()?.4:1 }}>↑</button>
        </div>
      </Box>
    </div>
  );
}

// ─── TAB: FORMS ──────────────────────────────────────────────────────────────
function FormsTab({ lang }) {
  const ln = langName(lang);
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [curAns, setCurAns] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function startForm(form) {
    setSelected(form); setStep(0); setAnswers({}); setResult(""); setQuestions([]); setLoading(true);
    try {
      const raw = await claude([{ role:"user", content:`Formular: "${form.label}" für ${form.behoerde}. Stelle 6 wichtige Fragen. NUR JSON Array:\n[{"id":"q0","frage":"Frage auf ${ln}","beispiel":"Beispiel auf ${ln}","pflicht":true}]` }],
        "Experte für deutsche Behördenformulare. NUR reines JSON ohne Backticks.", 600);
      setQuestions(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    } catch { setQuestions([{id:"q0",frage:"Ihr vollständiger Name?",beispiel:"Ahmad Al-Rashid",pflicht:true},{id:"q1",frage:"Ihre Adresse in Deutschland?",beispiel:"Musterstraße 1, 10115 Berlin",pflicht:true},{id:"q2",frage:"Geburtsdatum?",beispiel:"01.01.1990",pflicht:true},{id:"q3",frage:"Weitere relevante Angaben?",beispiel:"Bitte beschreiben Sie Ihre Situation",pflicht:false}]); }
    setLoading(false);
  }

  async function nextStep() {
    const newAnswers = { ...answers, [questions[step].id]: curAns };
    setAnswers(newAnswers); setCurAns("");
    if (step+1 >= questions.length) {
      setLoading(true);
      const ansText = questions.map(q=>`${q.frage}: ${newAnswers[q.id]||"—"}`).join("\n");
      const res = await claude([{ role:"user", content:`Erstelle ausgefüllten deutschen Antrag/Brief für "${selected.label}" an ${selected.behoerde}.\n\nAngaben:\n${ansText}\n\nVollständiges Dokument auf Deutsch mit korrekter Briefstruktur.` }],
        "Experte für deutsche Behördenformulare. Vollständige, korrekt formatierte Dokumente.", 1500);
      setResult(res); setLoading(false);
    } else { setStep(step+1); }
  }

  const q = questions[step];
  const progress = questions.length ? (step/questions.length)*100 : 0;

  // List view
  if (!selected) return (
    <div style={{ display:"flex", flexDirection:"column", gap:".6rem" }}>
      <div style={{ fontSize:".7rem", fontWeight:700, color:C.text3, textTransform:"uppercase", letterSpacing:".06em" }}>Formular auswählen</div>
      {FORMS.map(f=>(
        <button key={f.id} onClick={()=>startForm(f)} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:".875rem 1rem", cursor:"pointer", display:"flex", alignItems:"center", gap:".75rem", textAlign:"left", fontFamily:"inherit", boxShadow:"0 1px 3px rgba(0,0,0,.06)", transition:"all .15s" }}>
          <div style={{ width:42, height:42, borderRadius:10, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{f.icon}</div>
          <div>
            <div style={{ fontSize:".85rem", fontWeight:700, color:C.text }}>{f.label}</div>
            <div style={{ fontSize:".65rem", color:C.text3, fontWeight:500 }}>{f.behoerde}</div>
          </div>
          <span style={{ marginLeft:"auto", color:C.text3, fontSize:"1.1rem" }}>›</span>
        </button>
      ))}
    </div>
  );

  // Loading questions
  if (loading && questions.length===0) return <Box><Spinner label="Formular wird vorbereitet..."/></Box>;

  // Result
  if (result) return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      <Box style={{ background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)", border:`1.5px solid #6ee7b7` }}>
        <BoxHeader icon="✅" iconBg={C.greenL} title={`${selected.label} — Fertig!`} sub={selected.behoerde}/>
      </Box>
      <Disclaimer/>
      <LetterCard text={result}/>
      <Btn onClick={()=>{setSelected(null);setResult("");setStep(0);}}>📝 Anderes Formular ausfüllen</Btn>
    </div>
  );

  // Loading result
  if (loading) return <Box><Spinner label="Formular wird erstellt..."/></Box>;

  // Step view
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      {/* Header progress */}
      <Box>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".75rem" }}>
          <button onClick={()=>setSelected(null)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:".3rem .5rem", cursor:"pointer", fontSize:".9rem", color:C.text2 }}>←</button>
          <div style={{ width:32, height:32, borderRadius:8, background:selected.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem" }}>{selected.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:".82rem", fontWeight:700, color:C.text }}>{selected.label}</div>
            <div style={{ fontSize:".62rem", color:C.text3 }}>{selected.behoerde}</div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:".65rem", color:C.text3, fontWeight:600, marginBottom:".3rem" }}>
          <span>Frage {step+1} von {questions.length}</span>
          <span style={{ color:C.primary, fontWeight:700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height:6, background:"#e2e8f0", borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${C.primary},#60a5fa)`, borderRadius:3, transition:"width .4s ease" }}/>
        </div>
      </Box>

      {/* Question */}
      <Box accent="#bfdbfe">
        <BoxHeader icon={q?.pflicht?"✱":"○"} iconBg={q?.pflicht?C.primaryL:C.bg} title={q?.frage||""} sub={q?.pflicht?"Pflichtfeld":"Optional"}/>
        {q?.beispiel && <div style={{ fontSize:".65rem", color:C.text3, marginBottom:".65rem" }}>z.B.: {q.beispiel}</div>}
        <textarea autoFocus value={curAns} onChange={e=>setCurAns(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();nextStep();}}}
          placeholder="Ihre Antwort..."
          style={{ ...css.inp, minHeight:80, resize:"none" }} dir={langDir(lang)}/>
      </Box>

      <Btn onClick={nextStep} disabled={q?.pflicht&&!curAns.trim()}>
        {step+1>=questions.length?"📄 Formular erstellen":"Weiter →"}
      </Btn>
      {!q?.pflicht && <button onClick={()=>{setCurAns("");nextStep();}} style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:".72rem", textDecoration:"underline", fontFamily:"inherit" }}>Überspringen</button>}
    </div>
  );
}

// ─── TAB: WRITE ──────────────────────────────────────────────────────────────
function WriteTab({ lang }) {
  const [form, setForm] = useState({ name:"", strasse:"", ort:"", behoerde:"", typ:"", anliegen:"" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisc, setShowDisc] = useState(true);
  const up = k => e => setForm(p=>({...p,[k]:e.target.value}));

  async function gen() {
    setLoading(true); setResult("");
    const r = await claude([{ role:"user", content:`Schreibe formellen deutschen Behördenbrief.\nAbsender: ${form.name||"[Ihr Name]"}, ${form.strasse||"[Straße]"}, ${form.ort||"[PLZ Ort]"}\nDatum: ${new Date().toLocaleDateString("de-DE")}\nEmpfänger: ${form.behoerde||"Zuständige Behörde"}\nArt: ${form.typ||"Anfrage"}\nAnliegen: ${form.anliegen}` }],
      `Experte für Behördenbriefe. IMMER vollständiger formeller Brief auf Deutsch. Danach kurze Erklärung auf ${langName(lang)}.`, 1200);
    setResult(r); setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      {showDisc && <Disclaimer onClose={()=>setShowDisc(false)}/>}

      {/* Absender */}
      <Box>
        <BoxHeader icon="👤" iconBg="#dbeafe" title="Ihre Daten (Absender)"/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".5rem" }}>
          <Inp label="Ihr Name" placeholder="Max Mustermann" value={form.name} onChange={up("name")}/>
          <Inp label="Datum" value={new Date().toLocaleDateString("de-DE")} readOnly/>
        </div>
        <div style={{ marginTop:".5rem", display:"flex", flexDirection:"column", gap:".5rem" }}>
          <Inp label="Straße & Nr." placeholder="Musterstraße 1" value={form.strasse} onChange={up("strasse")}/>
          <Inp label="PLZ & Stadt" placeholder="12345 Berlin" value={form.ort} onChange={up("ort")}/>
        </div>
      </Box>

      {/* Empfänger */}
      <Box>
        <BoxHeader icon="🏛️" iconBg={C.orangeL} title="Empfänger & Art des Briefes"/>
        <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
          <Sel label="Behörde" value={form.behoerde} onChange={up("behoerde")}>
            <option value="">Behörde wählen...</option>
            {BEHOERDEN.map(b=><option key={b.id} value={b.name}>{b.icon} {b.name}</option>)}
          </Sel>
          <Sel label="Art des Briefes" value={form.typ} onChange={up("typ")}>
            <option value="">Art wählen...</option>
            {LETTER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </Sel>
        </div>
      </Box>

      {/* Anliegen */}
      <Box>
        <BoxHeader icon="💬" iconBg={C.purpleL} title="Ihr Anliegen" sub="Schreiben Sie in Ihrer Sprache"/>
        <textarea value={form.anliegen} onChange={up("anliegen")} placeholder="Beschreiben Sie Ihr Anliegen..."
          style={{ ...css.inp, minHeight:100, resize:"vertical" }} dir={langDir(lang)}/>
      </Box>

      {loading ? <Box><Spinner label="Schreibe Brief auf Deutsch..."/></Box>
               : <Btn onClick={gen} disabled={!form.anliegen.trim()}>✍️ Brief auf Deutsch erstellen</Btn>}

      {result && <LetterCard text={result}/>}
    </div>
  );
}

// ─── TAB: BEHÖRDEN ───────────────────────────────────────────────────────────
function ExplainTab({ lang }) {
  const ln = langName(lang);
  const [sel, setSel] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  async function explain(b) {
    setSel(b.id); setLoading(true); setResult("");
    const r = await claude([{ role:"user", content:`Erkläre die ${b.name} in Deutschland: Aufgaben, Zuständigkeiten, benötigte Dokumente, typische Situationen für Ausländer, wichtige Tipps.` }],
      `Freundlicher Berater für Ausländer in Deutschland. Antworte strukturiert auf ${ln} mit Emojis und klaren Abschnitten.`);
    setResult(r); setLoading(false);
  }

  async function ask() {
    if (!q.trim()) return;
    setLoading(true); setResult(""); setSel("question");
    const r = await claude([{ role:"user", content:q }], `Freundlicher Berater für Ausländer in Deutschland. Antworte hilfreich auf ${ln}.`);
    setResult(r); setLoading(false); setQ("");
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
      {/* Grid */}
      <Box>
        <BoxHeader icon="🏛️" iconBg="#dbeafe" title="Behörde auswählen" sub="Tippen Sie auf eine Karte"/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".45rem" }}>
          {BEHOERDEN.map(b=>(
            <button key={b.id} onClick={()=>explain(b)} style={{ background:sel===b.id?b.color:C.bg, border:`1.5px solid ${sel===b.id?"#93c5fd":C.border}`, borderRadius:10, padding:".75rem .65rem", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all .15s" }}>
              <div style={{ fontSize:"1.3rem", marginBottom:".2rem" }}>{b.icon}</div>
              <div style={{ fontSize:".72rem", fontWeight:700, color:C.text }}>{b.name}</div>
              <div style={{ fontSize:".58rem", color:C.text3 }}>{b.desc}</div>
            </button>
          ))}
        </div>
      </Box>

      {/* Frage */}
      <Box>
        <BoxHeader icon="❓" iconBg={C.purpleL} title="Eigene Frage stellen"/>
        <div style={{ display:"flex", gap:".4rem" }}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()}
            placeholder="Ihre Frage hier..." style={{ ...css.inp, flex:1 }} dir={langDir(lang)}/>
          <Btn onClick={ask} style={{ width:"auto", padding:".6rem 1rem" }}>Fragen</Btn>
        </div>
      </Box>

      {loading && <Box><Spinner/></Box>}
      {result && (
        <Box style={{ background:"linear-gradient(135deg,#eff6ff,#f0f9ff)", border:`1.5px solid #bfdbfe` }}>
          <BoxHeader icon={BEHOERDEN.find(b=>b.id===sel)?.icon||"💬"} iconBg="#dbeafe"
            title={BEHOERDEN.find(b=>b.id===sel)?.name||"Antwort"} sub={ln}/>
          <div style={{ fontSize:".8rem", color:"#1e3a5e", lineHeight:1.75, whiteSpace:"pre-wrap", direction:langDir(lang), textAlign:langDir(lang)==="rtl"?"right":"left" }}>{result}</div>
        </Box>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
const TABS = [
  { id:"scan",    icon:"📷", label:"Scannen" },
  { id:"chat",    icon:"🤖", label:"Assistent" },
  { id:"forms",   icon:"📝", label:"Formulare" },
  { id:"write",   icon:"✍️", label:"Brief" },
  { id:"explain", icon:"🏛️", label:"Behörden" },
];

export default function App() {
  const [tab, setTab] = useState("chat");
  const [lang, setLang] = useState("ar");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const curLang = LANGS.find(l=>l.code===lang);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", color:C.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        input:focus, textarea:focus, select:focus { border-color: ${C.primary} !important; background: white !important; outline: none; }
        button:active { filter: brightness(.94); }
        details summary { list-style: none; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:".875rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
          <div style={{ width:40, height:40, background:`linear-gradient(135deg,${C.primary},#3b82f6)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", boxShadow:`0 4px 12px ${C.primary}44` }}>🇩🇪</div>
          <div>
            <div style={{ fontSize:"1rem", fontWeight:800, color:C.text, letterSpacing:"-.01em" }}>Behörden Assistent</div>
            <div style={{ fontSize:".58rem", color:C.text3, fontWeight:500 }}>KI-Hilfe für Ausländer in Deutschland</div>
          </div>
        </div>

        {/* Lang picker */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>setShowLangMenu(!showLangMenu)} style={{ background:C.primaryL, border:`1.5px solid #bfdbfe`, borderRadius:20, padding:".35rem .8rem", fontSize:".78rem", fontWeight:700, color:C.primary, cursor:"pointer", display:"flex", alignItems:"center", gap:".35rem", fontFamily:"inherit" }}>
            {curLang?.flag} {curLang?.label} ▾
          </button>
          {showLangMenu && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:".4rem", zIndex:200, minWidth:170, boxShadow:"0 8px 32px rgba(0,0,0,.12)" }}>
              {LANGS.map(l=>(
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLangMenu(false);}} style={{ display:"flex", alignItems:"center", gap:".5rem", width:"100%", background:lang===l.code?C.primaryL:"transparent", border:"none", borderRadius:8, padding:".45rem .7rem", color:lang===l.code?C.primary:C.text2, cursor:"pointer", fontSize:".82rem", fontFamily:"inherit", fontWeight:lang===l.code?700:500 }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:68, zIndex:90, boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", borderBottom:tab===t.id?`2.5px solid ${C.primary}`:"2.5px solid transparent", color:tab===t.id?C.primary:C.text3, padding:".6rem .1rem", cursor:"pointer", fontSize:".56rem", fontWeight:tab===t.id?800:600, display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", transition:"all .2s", fontFamily:"inherit" }}>
            <span style={{ fontSize:".95rem" }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── LANG BANNER ── */}
      <div style={{ padding:".5rem 1rem 0", maxWidth:640, margin:"0 auto" }}>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:8, padding:".3rem .85rem", fontSize:".65rem", color:C.text3, display:"flex", alignItems:"center", gap:".4rem", boxShadow:"0 1px 2px rgba(0,0,0,.04)" }}>
          🌐 Antwortsprache: <strong style={{ color:C.primary }}>{curLang?.flag} {curLang?.label}</strong>
          <span style={{ marginLeft:"auto", opacity:.5 }}>Oben ändern ▴</span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding:".875rem 1rem 3rem", maxWidth:640, margin:"0 auto" }}>
        {tab==="scan"    && <ScanTab    lang={lang}/>}
        {tab==="chat"    && <ChatTab    lang={lang}/>}
        {tab==="forms"   && <FormsTab   lang={lang}/>}
        {tab==="write"   && <WriteTab   lang={lang}/>}
        {tab==="explain" && <ExplainTab lang={lang}/>}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ textAlign:"center", padding:".875rem 1rem", color:C.text3, fontSize:".6rem", borderTop:`1px solid ${C.border}`, background:C.white }}>
        🤖 KI-generierte Inhalte — immer vor dem Absenden prüfen • Kein Ersatz für Rechtsberatung
      </div>
    </div>
  );
}
