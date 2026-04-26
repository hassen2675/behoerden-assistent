import { useState, useRef, useCallback } from "react";

const LANGS = [
  { code:"ar", label:"عربي",       flag:"🇸🇦", dir:"rtl" },
  { code:"tr", label:"Türkçe",     flag:"🇹🇷", dir:"ltr" },
  { code:"uk", label:"Українська", flag:"🇺🇦", dir:"ltr" },
  { code:"ru", label:"Русский",    flag:"🇷🇺", dir:"ltr" },
  { code:"fa", label:"فارسی",      flag:"🇮🇷", dir:"rtl" },
  { code:"en", label:"English",    flag:"🇬🇧", dir:"ltr" },
  { code:"fr", label:"Français",   flag:"🇫🇷", dir:"ltr" },
  { code:"es", label:"Español",    flag:"🇪🇸", dir:"ltr" },
  { code:"vi", label:"Tiếng Việt", flag:"🇻🇳", dir:"ltr" },
];

const FORMS = [
  {id:"buergergeld",label:"Bürgergeld beantragen",  icon:"💶",bg:"#FEF9C3",behoerde:"Jobcenter"},
  {id:"widerspruch",label:"Widerspruch einlegen",   icon:"⚖️",bg:"#FEE2E2",behoerde:"Behörde"},
  {id:"kindergeld", label:"Kindergeld beantragen",  icon:"👶",bg:"#FCE7F3",behoerde:"Familienkasse"},
  {id:"anmeldung",  label:"Anmeldung / Ummeldung",  icon:"🏠",bg:"#EDE9FE",behoerde:"Einwohnermeldeamt"},
  {id:"aufenthalt", label:"Aufenthaltstitel",        icon:"🪪",bg:"#FFEDD5",behoerde:"Ausländerbehörde"},
  {id:"steuer",     label:"Steuererklärung",         icon:"📊",bg:"#DBEAFE",behoerde:"Finanzamt"},
];

const QUICK = [
  {icon:"✍️", label:"Antwortbrief\nschreiben",    prompt:"Ich habe einen Brief bekommen und brauche eine Antwort."},
  {icon:"💶", label:"Bürgergeld\nbeantragen",     prompt:"Ich möchte Bürgergeld beantragen. Bitte führe mich Schritt für Schritt."},
  {icon:"⚖️", label:"Widerspruch\neinlegen",      prompt:"Ich möchte Widerspruch gegen einen Bescheid einlegen."},
  {icon:"👶", label:"Kindergeld\nbeantragen",     prompt:"Ich möchte Kindergeld beantragen."},
  {icon:"🪪", label:"Aufenthaltstitel\nverlängern",prompt:"Ich muss meinen Aufenthaltstitel verlängern."},
  {icon:"📊", label:"Steuererklärung\nhelfen",    prompt:"Ich muss eine Steuererklärung machen."},
];

async function callClaude(messages, system, maxTokens=1200) {
  const r = await fetch("/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages}),
  });
  if(!r.ok) throw new Error(`${r.status}`);
  const d = await r.json();
  return d.content?.map(c=>c.text||"").join("")||"";
}

function toB64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}
function mtype(f){return f.type==="image/png"?"image/png":f.type==="image/webp"?"image/webp":"image/jpeg";}
function getLang(code){return LANGS.find(l=>l.code===code)||LANGS[0];}

// ── BIG BUTTON ──────────────────────────────────────────────────────────────
function Btn({children,onClick,disabled,bg="#1a56db",fg="white",icon,style={}}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%",padding:"22px 18px",
      background:disabled?"#D1D5DB":bg,
      color:disabled?"#9CA3AF":fg,
      border:"none",borderRadius:22,fontSize:20,fontWeight:800,
      cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",
      boxShadow:disabled?"none":`0 6px 20px ${bg}55`,
      display:"flex",alignItems:"center",justifyContent:"center",gap:12,
      transition:"all .15s",...style
    }}>
      {icon&&<span style={{fontSize:28}}>{icon}</span>}
      {children}
    </button>
  );
}

// ── CARD ────────────────────────────────────────────────────────────────────
function Card({children,style={},border="#E5E7EB"}) {
  return (
    <div style={{background:"white",borderRadius:24,padding:"20px 18px",
      border:`2px solid ${border}`,boxShadow:"0 2px 12px rgba(0,0,0,.06)",...style}}>
      {children}
    </div>
  );
}

// ── SPINNER ─────────────────────────────────────────────────────────────────
function Spinner({text="Bitte warten..."}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:36}}>
      <div style={{width:56,height:56,border:"5px solid #DBEAFE",borderTop:"5px solid #1a56db",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <div style={{fontSize:18,color:"#6B7280",fontWeight:600,textAlign:"center"}}>{text}</div>
    </div>
  );
}

// ── INFO BOX ────────────────────────────────────────────────────────────────
function InfoBox({emoji,title,text,bg,border,color,dir}) {
  return (
    <div style={{background:bg,border:`2px solid ${border}`,borderRadius:22,padding:"20px 18px"}}>
      <div style={{fontSize:19,fontWeight:900,color,marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:28}}>{emoji}</span>{title}
      </div>
      <div style={{fontSize:18,color,lineHeight:1.85,direction:dir||"ltr",
        textAlign:dir==="rtl"?"right":"left",whiteSpace:"pre-wrap"}}>{text}</div>
    </div>
  );
}

// ── COPY BTN ────────────────────────────────────────────────────────────────
function CopyBtn({text}) {
  const [ok,setOk]=useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2200);}}
      style={{background:ok?"#ECFDF5":"#F3F4F6",border:`2px solid ${ok?"#059669":"#E5E7EB"}`,
        borderRadius:16,padding:"14px 18px",fontSize:18,fontWeight:800,
        color:ok?"#059669":"#6B7280",cursor:"pointer",fontFamily:"inherit",
        display:"flex",alignItems:"center",gap:10,width:"100%",justifyContent:"center"}}>
      {ok?"✅ Kopiert!":"📋 Kopieren"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════
// SCAN TAB
// ══════════════════════════════════════════════════════════
function ScanTab({lang}) {
  const ln=getLang(lang);
  const [img,setImg]=useState(null);
  const [mt,setMt]=useState("image/jpeg");
  const [prev,setPrev]=useState(null);
  const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(false);
  const [reply,setReply]=useState("");
  const [replyLoading,setReplyLoading]=useState(false);
  const [err,setErr]=useState("");
  const fileRef=useRef(); const camRef=useRef();

  const handleFile=useCallback(async(file)=>{
    if(!file||!file.type.startsWith("image/")){setErr("Bitte ein Foto!");return;}
    setErr("");setRes(null);setReply("");
    setPrev(URL.createObjectURL(file));setMt(mtype(file));
    setImg(await toB64(file));
  },[]);

  async function analyze(){
    setLoading(true);setRes(null);setReply("");
    try{
      const raw=await callClaude([{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:mt,data:img}},
        {type:"text",text:`Analysiere diesen deutschen Behördenbrief. Antworte NUR mit reinem JSON ohne Backticks:\n{"behoerde":"...","betreff":"...","datum":"...","dringlichkeit":"hoch|mittel|niedrig","frist":"...oder null","uebersetzung":"Einfache Übersetzung auf ${ln.label}","erklaerung":"Einfache Erklärung auf ${ln.label} was der Brief bedeutet und was zu tun ist","schritte":["Schritt 1","Schritt 2"],"originaltext":"Originaltext"}`}
      ]}],"OCR-Experte für Behördenbriefe. NUR reines JSON ohne Backticks.",1500);
      setRes(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch{setErr("Fehler! Bitte deutlicheres Foto versuchen.");}
    setLoading(false);
  }

  async function genReply(){
    setReplyLoading(true);setReply("");
    const r=await callClaude([{role:"user",content:`Schreibe vollständigen deutschen Antwortbrief.\nBehörde: ${res.behoerde}\nBetreff: ${res.betreff}\nDatum: ${new Date().toLocaleDateString("de-DE")}\nOriginaltext: ${res.originaltext}`}],
      `Experte für Behördenbriefe. Vollständiger formeller Brief auf Deutsch. Dann kurze Erklärung auf ${ln.label}.`,1200);
    setReply(r);setReplyLoading(false);
  }

  const reset=()=>{setPrev(null);setImg(null);setRes(null);setReply("");setErr("");};
  const urgStyle={
    hoch:  {bg:"#FEF2F2",border:"#DC2626",txt:"#991B1B",badge:"⚠️ Dringend!"},
    mittel:{bg:"#FFFBEB",border:"#D97706",txt:"#78350F",badge:"📌 Wichtig"},
    niedrig:{bg:"#ECFDF5",border:"#059669",txt:"#064E3B",badge:"✅ Normal"},
  };
  const u=urgStyle[res?.dringlichkeit]||urgStyle.mittel;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>
      <input ref={camRef} type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e.target.files[0])} style={{display:"none"}}/>

      {/* Upload */}
      {!prev && (
        <Card style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:80,marginBottom:18}}>📄</div>
          <div style={{fontSize:28,fontWeight:900,marginBottom:10}}>Brief fotografieren</div>
          <div style={{fontSize:18,color:"#6B7280",marginBottom:30,lineHeight:1.7}}>
            Machen Sie ein Foto von Ihrem Brief.<br/>Die KI liest und erklärt alles!
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Btn icon="📷" onClick={()=>camRef.current.click()} style={{padding:"26px",fontSize:24}}>Kamera öffnen</Btn>
            <Btn icon="🖼️" onClick={()=>fileRef.current.click()} bg="#F3F4F6" fg="#374151" style={{padding:"26px",fontSize:24,boxShadow:"none",border:"2px solid #E5E7EB"}}>Bild auswählen</Btn>
          </div>
        </Card>
      )}

      {/* Preview + Analyze */}
      {prev && !res && (
        <Card>
          <img src={prev} alt="Brief" style={{width:"100%",borderRadius:18,maxHeight:300,objectFit:"contain",background:"#F3F4F6"}}/>
          {err && <div style={{color:"#DC2626",fontSize:18,fontWeight:800,textAlign:"center",marginTop:14,padding:14,background:"#FEF2F2",borderRadius:14}}>{err}</div>}
          {!loading && (
            <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:14}}>
              <Btn icon="🔍" onClick={analyze} style={{padding:"26px",fontSize:24}}>Jetzt analysieren!</Btn>
              <Btn icon="✕" onClick={reset} bg="#F3F4F6" fg="#374151" style={{padding:"20px",fontSize:20,boxShadow:"none",border:"2px solid #E5E7EB"}}>Neues Foto</Btn>
            </div>
          )}
          {loading && <Spinner text="Brief wird gelesen und übersetzt..."/>}
        </Card>
      )}

      {/* Results */}
      {res && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Dringlichkeit Header */}
          <div style={{background:u.bg,border:`3px solid ${u.border}`,borderRadius:24,padding:"22px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:20,fontWeight:900,color:u.txt}}>{res.behoerde||"Behörde"}</div>
              <div style={{background:u.border,color:"white",borderRadius:14,padding:"10px 18px",fontSize:18,fontWeight:900}}>{u.badge}</div>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:u.txt,marginBottom:8}}>{res.betreff}</div>
            {res.datum && <div style={{fontSize:15,color:"#6B7280"}}>📅 {res.datum}</div>}
            {res.frist && (
              <div style={{background:"#FEF2F2",border:"2px solid #DC2626",borderRadius:14,padding:"14px 18px",marginTop:14,fontSize:20,fontWeight:900,color:"#DC2626"}}>
                ⏰ Frist: {res.frist}
              </div>
            )}
          </div>

          {/* Translation */}
          <InfoBox emoji="🌐" title={`Übersetzung — ${ln.label}`} text={res.uebersetzung} bg="#EBF5FF" border="#1a56db" color="#1e3a8a" dir={ln.dir}/>

          {/* Explanation */}
          <InfoBox emoji="💡" title="Was bedeutet das?" text={res.erklaerung} bg="#ECFDF5" border="#059669" color="#064E3B" dir={ln.dir}/>

          {/* Steps */}
          {res.schritte?.length>0 && (
            <Card border="#1a56db">
              <div style={{fontSize:21,fontWeight:900,marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:30}}>📋</span>Was jetzt tun?
              </div>
              {res.schritte.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:16}}>
                  <div style={{width:40,height:40,minWidth:40,background:"#1a56db",color:"white",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900}}>{i+1}</div>
                  <div style={{fontSize:19,lineHeight:1.7,paddingTop:8,direction:ln.dir}}>{s}</div>
                </div>
              ))}
            </Card>
          )}

          {/* Reply */}
          {!reply && !replyLoading && <Btn icon="✍️" onClick={genReply} style={{padding:"26px",fontSize:22}}>Antwortbrief schreiben</Btn>}
          {replyLoading && <Card><Spinner text="Antwortbrief wird geschrieben..."/></Card>}
          {reply && (
            <Card border="#D97706" style={{background:"#FFFBEB"}}>
              <div style={{fontSize:21,fontWeight:900,marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:30}}>✉️</span>Ihr Antwortbrief
              </div>
              <div style={{background:"white",border:"2px solid #FDE68A",borderRadius:16,padding:18,fontFamily:"'Courier New',monospace",fontSize:14,lineHeight:1.9,whiteSpace:"pre-wrap",marginBottom:16}}>{reply}</div>
              <CopyBtn text={reply}/>
            </Card>
          )}

          <Btn icon="📷" onClick={reset} bg="#F3F4F6" fg="#374151" style={{padding:"22px",fontSize:20,boxShadow:"none",border:"2px solid #E5E7EB"}}>Neuen Brief scannen</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CHAT TAB
// ══════════════════════════════════════════════════════════
function ChatTab({lang}) {
  const ln=getLang(lang);
  const SYS=`Du bist ein geduldiger, freundlicher Helfer für Ausländer in Deutschland.
Antworte auf ${ln.label} — kurze klare einfache Sätze.
Briefe und Formulare immer auf PERFEKTEM DEUTSCH.
Stelle eine Frage nach der anderen. Sei warm und geduldig.`;

  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 Hallo!\n\nIch helfe Ihnen mit deutschen Behörden.\n\nWählen Sie unten oder schreiben Sie Ihre Frage!",intro:true}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showQ,setShowQ]=useState(true);
  const bottomRef=useRef();

  function isLetter(t){return t.includes("Sehr geehrte")||t.includes("Mit freundlichen Grüßen");}

  async function send(text){
    const msg=text||input;
    if(!msg.trim()||loading)return;
    setInput("");setShowQ(false);
    const nm=[...msgs,{role:"user",content:msg}];
    setMsgs(nm);setLoading(true);
    try{
      const r=await callClaude(nm.filter(m=>!m.intro).map(m=>({role:m.role,content:m.content})),SYS,1400);
      setMsgs([...nm,{role:"assistant",content:r}]);
    }catch{setMsgs([...nm,{role:"assistant",content:"⚠️ Verbindungsfehler. Bitte nochmal versuchen."}]);}
    setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Quick Actions */}
      {showQ && (
        <Card>
          <div style={{fontSize:22,fontWeight:900,marginBottom:18}}>Was möchten Sie tun?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {QUICK.map(a=>(
              <button key={a.label} onClick={()=>send(a.prompt)} style={{
                background:"#EBF5FF",border:"2px solid #1a56db",borderRadius:20,
                padding:"20px 12px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",
                transition:"all .15s"
              }}>
                <div style={{fontSize:36,marginBottom:10}}>{a.icon}</div>
                <div style={{fontSize:15,fontWeight:800,color:"#1e3a8a",lineHeight:1.4,whiteSpace:"pre"}}>{a.label}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Chat Box */}
      <Card style={{padding:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:14,maxHeight:420,overflowY:"auto",paddingBottom:8}}>
          {msgs.map((m,i)=>{
            const hasLetter=m.role==="assistant"&&isLetter(m.content);
            let expl=m.content,letter="";
            if(hasLetter){const idx=m.content.indexOf("Sehr geehrte");if(idx>30){expl=m.content.slice(0,idx).trim();letter=m.content.slice(idx).trim();}else{expl="";letter=m.content;}}
            return (
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:6}}>
                {m.role==="assistant"&&<span style={{fontSize:13,color:"#9CA3AF",fontWeight:600,marginLeft:4}}>🤖 Assistent</span>}
                {(expl||!hasLetter)&&(
                  <div style={{maxWidth:"92%",background:m.role==="user"?"#1a56db":"#F3F4F6",
                    color:m.role==="user"?"white":"#111827",
                    borderRadius:m.role==="user"?"22px 22px 6px 22px":"22px 22px 22px 6px",
                    padding:"16px 20px",fontSize:19,lineHeight:1.75,whiteSpace:"pre-wrap",fontWeight:500,
                    direction:m.role==="user"?ln.dir:"ltr",
                    textAlign:m.role==="user"&&ln.dir==="rtl"?"right":"left"
                  }}>{expl||m.content}</div>
                )}
                {hasLetter&&letter&&(
                  <div style={{width:"96%"}}>
                    <div style={{fontSize:16,fontWeight:900,color:"#D97706",marginBottom:10}}>📄 Fertiger Brief (Deutsch):</div>
                    <div style={{background:"#FFFBEB",border:"2px solid #FDE68A",borderRadius:18,padding:16,fontFamily:"'Courier New',monospace",fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap",marginBottom:12}}>{letter}</div>
                    <CopyBtn text={letter}/>
                  </div>
                )}
              </div>
            );
          })}
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:6}}>
              <span style={{fontSize:13,color:"#9CA3AF",fontWeight:600,marginLeft:4}}>🤖 Assistent</span>
              <div style={{background:"#F3F4F6",borderRadius:"22px 22px 22px 6px",padding:"18px 22px",display:"flex",gap:8}}>
                {[0,.2,.4].map(d=><span key={d} style={{width:12,height:12,background:"#1a56db",borderRadius:"50%",display:"block",animation:`bounce 1s ${d}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{borderTop:"2px solid #E5E7EB",paddingTop:16,marginTop:10,display:"flex",gap:12,alignItems:"flex-end"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Schreiben Sie hier..."
            style={{flex:1,background:"#F3F4F6",border:"2px solid #E5E7EB",borderRadius:18,
              color:"#111827",padding:"16px 18px",fontFamily:"inherit",fontSize:19,
              outline:"none",resize:"none",height:60,lineHeight:1.4,direction:ln.dir}}
            dir={ln.dir}
          />
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
            width:60,height:60,background:"#1a56db",color:"white",border:"none",
            borderRadius:"50%",fontSize:26,cursor:"pointer",flexShrink:0,
            opacity:loading||!input.trim()?.4:1,boxShadow:"0 4px 16px rgba(26,86,219,.35)"
          }}>↑</button>
        </div>
      </Card>

      {!showQ&&(
        <button onClick={()=>setShowQ(true)} style={{background:"#F3F4F6",border:"2px solid #E5E7EB",borderRadius:18,padding:"16px",fontSize:17,fontWeight:700,color:"#6B7280",cursor:"pointer",fontFamily:"inherit"}}>
          ← Zurück zu den Optionen
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FORMS TAB
// ══════════════════════════════════════════════════════════
function FormsTab({lang}) {
  const ln=getLang(lang);
  const [sel,setSel]=useState(null);
  const [qs,setQs]=useState([]);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [curAns,setCurAns]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);

  async function startForm(form){
    setSel(form);setStep(0);setAnswers({});setResult("");setQs([]);setLoading(true);
    try{
      const raw=await callClaude([{role:"user",content:`Formular: "${form.label}". Stelle 5 einfache Fragen auf ${ln.label}. NUR reines JSON Array:\n[{"id":"q0","frage":"Frage","beispiel":"Beispiel","pflicht":true}]`}],
        "Experte für Formulare. NUR JSON ohne Backticks.",600);
      setQs(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch{
      setQs([
        {id:"q0",frage:"Ihr vollständiger Name?",beispiel:"Ahmad Al-Rashid",pflicht:true},
        {id:"q1",frage:"Ihre Adresse in Deutschland?",beispiel:"Musterstraße 1, 10115 Berlin",pflicht:true},
        {id:"q2",frage:"Ihr Geburtsdatum?",beispiel:"01.01.1990",pflicht:true},
        {id:"q3",frage:"Weitere Angaben?",beispiel:"Beschreiben Sie Ihre Situation",pflicht:false},
      ]);
    }
    setLoading(false);
  }

  async function nextStep(){
    const na={...answers,[qs[step].id]:curAns};
    setAnswers(na);setCurAns("");
    if(step+1>=qs.length){
      setLoading(true);
      const txt=qs.map(q=>`${q.frage}: ${na[q.id]||"—"}`).join("\n");
      const r=await callClaude([{role:"user",content:`Erstelle vollständigen deutschen Antrag für "${sel.label}".\n\nAngaben:\n${txt}`}],
        "Experte für Formulare. Vollständiger formeller Brief auf Deutsch.",1500);
      setResult(r);setLoading(false);
    }else{setStep(step+1);}
  }

  // Form List
  if(!sel) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:24,fontWeight:900,color:"#111827",marginBottom:4}}>Welches Formular?</div>
      {FORMS.map(f=>(
        <button key={f.id} onClick={()=>startForm(f)} style={{
          background:"white",border:"2px solid #E5E7EB",borderRadius:24,
          padding:"22px 18px",cursor:"pointer",display:"flex",alignItems:"center",
          gap:18,textAlign:"left",fontFamily:"inherit",boxShadow:"0 2px 10px rgba(0,0,0,.05)"
        }}>
          <div style={{width:68,height:68,background:f.bg,borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,flexShrink:0}}>{f.icon}</div>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#111827"}}>{f.label}</div>
            <div style={{fontSize:15,color:"#6B7280",marginTop:4}}>{f.behoerde}</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:26,color:"#9CA3AF"}}>›</div>
        </button>
      ))}
    </div>
  );

  // Result
  if(result) return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card border="#059669" style={{background:"#ECFDF5",textAlign:"center",padding:"28px"}}>
        <div style={{fontSize:56,marginBottom:10}}>✅</div>
        <div style={{fontSize:24,fontWeight:900}}>{sel.label}</div>
        <div style={{fontSize:16,color:"#6B7280",marginTop:6}}>Bitte vor dem Absenden prüfen!</div>
      </Card>
      <div style={{background:"#FFFBEB",border:"2px solid #FDE68A",borderRadius:22,padding:20,fontFamily:"'Courier New',monospace",fontSize:13,lineHeight:1.9,whiteSpace:"pre-wrap"}}>{result}</div>
      <CopyBtn text={result}/>
      <Btn icon="📝" onClick={()=>{setSel(null);setResult("");setStep(0);}} bg="#F3F4F6" fg="#374151" style={{padding:"22px",fontSize:20,boxShadow:"none",border:"2px solid #E5E7EB"}}>Anderes Formular ausfüllen</Btn>
    </div>
  );

  // Loading
  if(loading) return <Card><Spinner text={qs.length===0?"Formular wird vorbereitet...":"Formular wird erstellt..."}/></Card>;
  if(qs.length===0) return <Card><Spinner/></Card>;

  const q=qs[step];
  const pct=Math.round((step/qs.length)*100);

  // Step
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Progress */}
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <button onClick={()=>setSel(null)} style={{background:"#F3F4F6",border:"none",borderRadius:16,padding:"14px 18px",cursor:"pointer",fontSize:22,color:"#6B7280"}}>←</button>
          <div style={{width:52,height:52,background:sel.bg,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{sel.icon}</div>
          <div style={{fontSize:19,fontWeight:900}}>{sel.label}</div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:17,color:"#6B7280",fontWeight:700,marginBottom:10}}>
          <span>Frage {step+1} von {qs.length}</span>
          <span style={{color:"#1a56db",fontWeight:900}}>{pct}%</span>
        </div>
        <div style={{height:14,background:"#E5E7EB",borderRadius:7,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#1a56db,#60A5FA)",borderRadius:7,transition:"width .4s"}}/>
        </div>
      </Card>

      {/* Question */}
      <Card border="#1a56db" style={{padding:"26px 20px"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#1a56db",textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>
          {q.pflicht?"✱ Pflichtfeld":"Optional"}
        </div>
        <div style={{fontSize:24,fontWeight:900,marginBottom:14,lineHeight:1.35,direction:ln.dir}}>{q.frage}</div>
        {q.beispiel&&<div style={{fontSize:17,color:"#6B7280",marginBottom:20}}>z.B.: {q.beispiel}</div>}
        <textarea autoFocus value={curAns} onChange={e=>setCurAns(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();nextStep();}}}
          placeholder="Ihre Antwort..."
          style={{width:"100%",background:"#F3F4F6",border:"2px solid #E5E7EB",borderRadius:18,
            color:"#111827",padding:"18px",fontFamily:"inherit",fontSize:20,outline:"none",
            resize:"none",minHeight:110,lineHeight:1.5,direction:ln.dir}}
          dir={ln.dir}
        />
      </Card>

      <Btn onClick={nextStep} disabled={q.pflicht&&!curAns.trim()}
        icon={step+1>=qs.length?"📄":"→"} style={{padding:"26px",fontSize:24}}>
        {step+1>=qs.length?"Formular erstellen!":"Weiter"}
      </Btn>
      {!q.pflicht&&<button onClick={()=>{setCurAns("");nextStep();}} style={{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:17,textDecoration:"underline",fontFamily:"inherit"}}>Überspringen</button>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════
const TABS=[
  {id:"scan", icon:"📷", label:"Brief\nscannen"},
  {id:"chat", icon:"🤖", label:"KI\nAssistent"},
  {id:"forms",icon:"📝", label:"Formular\nausfüllen"},
];

export default function App() {
  const [tab,setTab]=useState("scan");
  const [lang,setLang]=useState("ar");
  const [showLP,setShowLP]=useState(false);
  const ln=getLang(lang);

  return (
    <div style={{minHeight:"100vh",background:"#F5F7FA",fontFamily:"'Rubik',sans-serif",maxWidth:540,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;background:#F5F7FA}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        input:focus,textarea:focus{outline:3px solid #1a56db!important;outline-offset:2px}
        button:active{transform:scale(.97)}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:"white",borderBottom:"2px solid #E5E7EB",padding:"16px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 10px rgba(0,0,0,.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:50,height:50,background:"#1a56db",borderRadius:16,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,boxShadow:"0 4px 14px rgba(26,86,219,.3)"}}>🇩🇪</div>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#111827",letterSpacing:"-.01em"}}>Behörden Assistent</div>
            <div style={{fontSize:13,color:"#9CA3AF",fontWeight:500}}>KI-Hilfe für Ausländer in Deutschland</div>
          </div>
        </div>

        {/* Language Picker */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLP(!showLP)} style={{
            background:"#EBF5FF",border:"2px solid #1a56db",borderRadius:16,
            padding:"11px 15px",fontSize:17,fontWeight:900,color:"#1e3a8a",
            cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit"}}>
            {ln.flag} {ln.label} ▾
          </button>
          {showLP&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:"white",
              border:"2px solid #E5E7EB",borderRadius:22,padding:8,zIndex:200,minWidth:200,
              boxShadow:"0 10px 40px rgba(0,0,0,.15)",maxHeight:360,overflowY:"auto"}}>
              {LANGS.map(l=>(
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLP(false);}} style={{
                  display:"flex",alignItems:"center",gap:14,width:"100%",
                  background:lang===l.code?"#EBF5FF":"transparent",
                  border:"none",borderRadius:14,padding:"14px 16px",
                  color:lang===l.code?"#1e3a8a":"#6B7280",cursor:"pointer",
                  fontSize:18,fontFamily:"inherit",fontWeight:lang===l.code?900:500}}>
                  <span style={{fontSize:24}}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{display:"flex",background:"white",borderBottom:"2px solid #E5E7EB",
        position:"sticky",top:82,zIndex:90}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,background:"none",border:"none",
            borderBottom:tab===t.id?"5px solid #1a56db":"5px solid transparent",
            color:tab===t.id?"#1a56db":"#9CA3AF",
            padding:"16px 4px 13px",cursor:"pointer",
            fontSize:12,fontWeight:tab===t.id?900:600,
            display:"flex",flexDirection:"column",alignItems:"center",gap:5,
            fontFamily:"inherit",transition:"all .2s",lineHeight:1.4,whiteSpace:"pre"}}>
            <span style={{fontSize:26}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{padding:"18px 14px 120px"}}>
        {tab==="scan"  && <ScanTab  lang={lang}/>}
        {tab==="chat"  && <ChatTab  lang={lang}/>}
        {tab==="forms" && <FormsTab lang={lang}/>}
      </div>

      {/* ── FOOTER ── */}
      <div style={{textAlign:"center",padding:14,color:"#9CA3AF",fontSize:13,borderTop:"1px solid #E5E7EB",
        background:"white",position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:540}}>
        🤖 KI-generiert — vor dem Absenden prüfen • Kein Ersatz für Rechtsberatung
      </div>
    </div>
  );
}
