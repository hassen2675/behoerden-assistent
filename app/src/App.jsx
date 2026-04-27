Deutsch.",1500);
   {fontSize:14,fontWeight:700,color:"#1a56db",textTransform:"uppercase",letterSpacing:".06em",marginBottom:12}}>
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
