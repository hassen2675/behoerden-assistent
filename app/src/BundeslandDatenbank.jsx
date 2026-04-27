import { useState } from "react";

// ── Bundesländer ──────────────────────────────────────────────────────────────
const BUNDESLAENDER = [
  "Baden-Württemberg","Bayern","Berlin","Brandenburg","Bremen",
  "Hamburg","Hessen","Mecklenburg-Vorpommern","Niedersachsen",
  "Nordrhein-Westfalen","Rheinland-Pfalz","Saarland","Sachsen",
  "Sachsen-Anhalt","Schleswig-Holstein","Thüringen",
];

// ── Behörden — NUR bundesweit korrekte Daten ──────────────────────────────────
function getBehoerden(stadt) {
  const s = encodeURIComponent(stadt);
  const gMaps = (q) => `https://www.google.com/maps/search/${encodeURIComponent(q+" "+stadt)}`;

  return [
    {
      icon:"💼", name:"Jobcenter",
      was:"Bürgergeld • Arbeit suchen • Ausbildung",
      farbe:"#1a56db", farbeL:"#EBF5FF",
      // Offizielle BA-Dienststellen-Suche mit Stadt
      suchLink:`https://web.arbeitsagentur.de/portal/metasuche/suche/dienststellen?ort=${s}&d=JCTR`,
      suchText:`Jobcenter ${stadt} auf arbeitsagentur.de suchen`,
      // Google Maps als Backup für lokale Nummer
      telSuchLink: gMaps("Jobcenter"),
      telSuchText: `Telefonnummer Jobcenter ${stadt} finden`,
      onlineLink:"https://www.jobcenter.digital",
      onlineText:"Bürgergeld online beantragen (kein Besuch nötig)",
      // NUR bundesweit verifizierte Nummern
      bundesHotlines:[
        {n:"Bundesagentur für Arbeit", tel:"0800 4 5555 00", info:"Kostenlos • Mo-Fr 8–18 Uhr"},
      ],
      tipp:"Bürgergeld können Sie komplett online beantragen — kein Besuch nötig!",
    },
    {
      icon:"🪪", name:"Ausländerbehörde",
      was:"Aufenthaltstitel • Visa • Niederlassungserlaubnis",
      farbe:"#7c3aed", farbeL:"#EDE9FE",
      suchLink:`https://bamf-navi.bamf.de/de/Themen/Behoerden/?ort=${s}`,
      suchText:`Ausländerbehörde ${stadt} auf BAMF-NAvI suchen`,
      telSuchLink: gMaps("Ausländerbehörde"),
      telSuchText: `Telefonnummer Ausländerbehörde ${stadt} finden`,
      onlineLink:"https://www.verwaltung.bund.de",
      onlineText:"Termin online buchen (wenn verfügbar)",
      bundesHotlines:[
        {n:"BAMF Infotelefon", tel:"0228 99 615-0", info:"Mo-Fr 9–15 Uhr • Nur allgemeine Infos, NICHT lokal!"},
      ],
      tipp:"⚠️ Termin ist Pflicht! Bitte zuerst Termin online buchen. Die lokale Telefonnummer finden Sie über den Such-Link.",
    },
    {
      icon:"🏠", name:"Bürgeramt / Meldestelle",
      was:"Anmeldung • Ummeldung • Personalausweis • Reisepass",
      farbe:"#d97706", farbeL:"#FEF3C7",
      suchLink:`https://www.verwaltung.bund.de/DE/Nav/Leistungen/Suche.html?suche=buergeramt+${s}`,
      suchText:`Bürgeramt ${stadt} auf verwaltung.bund.de suchen`,
      telSuchLink: gMaps("Bürgeramt"),
      telSuchText: `Telefonnummer Bürgeramt ${stadt} finden`,
      onlineLink:"https://www.verwaltung.bund.de",
      onlineText:"Online-Termin buchen",
      bundesHotlines:[
        {n:"Bürgertelefon (alle Behörden)", tel:"115", info:"Kostenlos • Mo-Fr 8–18 Uhr • Verbindet Sie weiter!"},
      ],
      tipp:"Anmeldung muss innerhalb 2 Wochen nach Einzug erfolgen! Rufen Sie 115 an — die verbinden Sie mit dem richtigen Bürgeramt.",
    },
    {
      icon:"📊", name:"Finanzamt",
      was:"Steuererklärung • Steuer-ID • Lohnsteuer",
      farbe:"#059669", farbeL:"#ECFDF5",
      suchLink:`https://www.elster.de/eportal/start`,
      suchText:`Finanzamt ${stadt} finden`,
      telSuchLink: gMaps("Finanzamt"),
      telSuchText: `Telefonnummer Finanzamt ${stadt} finden`,
      onlineLink:"https://www.elster.de",
      onlineText:"Steuererklärung online mit ELSTER (kein Besuch nötig!)",
      bundesHotlines:[
        {n:"Bürgertelefon (verbindet weiter)", tel:"115", info:"Kostenlos • Mo-Fr 8–18 Uhr"},
      ],
      tipp:"Steuererklärung komplett online mit ELSTER.de — Sie müssen nicht zum Finanzamt!",
    },
    {
      icon:"👶", name:"Familienkasse (Kindergeld)",
      was:"Kindergeld beantragen • Kinderzuschlag",
      farbe:"#e11d48", farbeL:"#FFF1F2",
      suchLink:`https://www.arbeitsagentur.de/ortsverz-famka?ort=${s}`,
      suchText:`Familienkasse ${stadt} auf arbeitsagentur.de suchen`,
      telSuchLink: gMaps("Familienkasse"),
      telSuchText: `Telefonnummer Familienkasse ${stadt} finden`,
      onlineLink:"https://www.arbeitsagentur.de/kindergeld-online",
      onlineText:"Kindergeld online beantragen (kein Besuch nötig!)",
      bundesHotlines:[
        {n:"Familienkasse Hotline", tel:"0800 4555530", info:"Kostenlos • Mo-Fr 8–18 Uhr"},
      ],
      tipp:"Kindergeld können Sie komplett online beantragen! Die kostenlose Hotline hilft bei allen Fragen.",
    },
    {
      icon:"🏥", name:"Sozialamt",
      was:"Sozialhilfe • Wohngeld • Grundsicherung im Alter",
      farbe:"#0891b2", farbeL:"#ECFEFF",
      suchLink:`https://www.verwaltung.bund.de/DE/Nav/Leistungen/Suche.html?suche=sozialamt+${s}`,
      suchText:`Sozialamt ${stadt} suchen`,
      telSuchLink: gMaps("Sozialamt"),
      telSuchText: `Telefonnummer Sozialamt ${stadt} finden`,
      onlineLink:"https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohngeld/wohngeld-node.html",
      onlineText:"Wohngeld Informationen",
      bundesHotlines:[
        {n:"Bürgertelefon (verbindet weiter)", tel:"115", info:"Kostenlos • Mo-Fr 8–18 Uhr"},
      ],
      tipp:"Das Sozialamt ist Teil der Stadtverwaltung. Rufen Sie 115 an — die geben Ihnen die richtige lokale Nummer!",
    },
    {
      icon:"🗣️", name:"Integrationskurs / Deutschkurs",
      was:"Deutschkurs finden • BAMF-Kurs • Sprachberatung",
      farbe:"#ea580c", farbeL:"#FFF7ED",
      suchLink:`https://bamf-navi.bamf.de/de/Themen/Integrationskurse/?ort=${s}`,
      suchText:`Integrationskurs in ${stadt} finden (BAMF-NAvI)`,
      telSuchLink:`https://bamf-navi.bamf.de/de/Themen/Integrationskurse/?ort=${s}`,
      telSuchText:`Kursanbieter in ${stadt} mit Telefon anzeigen`,
      onlineLink:`https://bamf-navi.bamf.de/de/Themen/Integrationskurse/?ort=${s}`,
      onlineText:`Integrationskurs in ${stadt} finden`,
      bundesHotlines:[
        {n:"BAMF Infotelefon", tel:"0228 99 615-0", info:"Mo-Fr 9–15 Uhr • Kursberatung"},
      ],
      tipp:"Integrationskurse sind für viele Ausländer kostenlos oder sehr günstig! BAMF-NAvI zeigt alle Kurse in Ihrer Stadt.",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BundeslandDatenbank({ onSelectBehoerde }) {
  const [stadt,      setStadt]   = useState("");
  const [bundesland, setBl]      = useState("");
  const [gesucht,    setGesucht] = useState(false);
  const [selBeh,     setSelBeh]  = useState(null);

  const C = {
    blue:"#1a56db",blueL:"#EBF5FF",blueD:"#1e3a8a",
    green:"#059669",greenL:"#ECFDF5",
    gold:"#d97706",goldL:"#FFFBEB",
    gray:"#6B7280",grayL:"#F3F4F6",
    border:"#E5E7EB",ink:"#111827",
    red:"#DC2626",redL:"#FEF2F2",
  };

  const behoerden = gesucht ? getBehoerden(stadt) : [];
  const beh = behoerden.find(b => b.name === selBeh);

  function suchen() {
    if (stadt.trim().length < 2) return;
    setGesucht(true);
    setSelBeh(null);
  }

  function reset() {
    setGesucht(false);
    setSelBeh(null);
    setStadt("");
    setBl("");
  }

  // ── DETAIL ANSICHT ────────────────────────────────────────────────────────
  if (gesucht && selBeh && beh) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={()=>setSelBeh(null)}
        style={{background:C.grayL,border:`2px solid ${C.border}`,borderRadius:14,padding:"12px 18px",cursor:"pointer",fontSize:16,fontWeight:700,color:C.gray,fontFamily:"inherit",textAlign:"left"}}>
        ← Zurück zu {stadt}
      </button>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${beh.farbe}ee,${beh.farbe})`,borderRadius:24,padding:"24px 18px",color:"white"}}>
        <div style={{fontSize:48,marginBottom:10}}>{beh.icon}</div>
        <div style={{fontSize:24,fontWeight:900}}>{beh.name}</div>
        <div style={{fontSize:16,opacity:.85,marginTop:4}}>📍 {stadt}{bundesland?`, ${bundesland}`:""}</div>
        <div style={{fontSize:14,opacity:.75,marginTop:2}}>{beh.was}</div>
      </div>

      {/* Tipp */}
      <div style={{background:beh.farbeL,border:`2px solid ${beh.farbe}44`,borderRadius:18,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <span style={{fontSize:22,flexShrink:0}}>💡</span>
        <div style={{fontSize:15,color:C.ink,fontWeight:600,lineHeight:1.6}}>{beh.tipp}</div>
      </div>

      {/* 1. LOKALE BEHÖRDE SUCHEN — wichtigste Aktion */}
      <div style={{background:"white",border:`3px solid ${beh.farbe}`,borderRadius:22,padding:"18px 16px"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.ink,marginBottom:12}}>
          🔍 Schritt 1 — Lokale Behörde finden:
        </div>
        <a href={beh.suchLink} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:10,background:beh.farbe,color:"white",borderRadius:18,padding:"18px",fontSize:18,fontWeight:800,textDecoration:"none",marginBottom:10,boxShadow:`0 6px 20px ${beh.farbe}44`}}>
          <span style={{fontSize:24}}>🔍</span>
          <span>{beh.suchText}</span>
        </a>
        <div style={{fontSize:13,color:C.gray,textAlign:"center"}}>
          ↑ Dort finden Sie Adresse, lokale Telefonnummer und Öffnungszeiten
        </div>
      </div>

      {/* 2. TELEFONNUMMER LOKAL FINDEN */}
      <div style={{background:"white",border:`2px solid ${C.border}`,borderRadius:20,padding:"16px"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.ink,marginBottom:10}}>
          📞 Schritt 2 — Lokale Telefonnummer finden:
        </div>
        <a href={beh.telSuchLink} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",gap:10,background:C.grayL,border:`2px solid ${C.border}`,borderRadius:14,padding:"14px",fontSize:16,fontWeight:700,color:C.ink,textDecoration:"none",marginBottom:8}}>
          <span style={{fontSize:22}}>🗺️</span>
          <span>{beh.telSuchText}</span>
          <span style={{marginLeft:"auto",fontSize:16,color:C.gray}}>↗</span>
        </a>
        <div style={{fontSize:12,color:C.gray,lineHeight:1.5,padding:"8px 4px"}}>
          ⚠️ Wir zeigen keine lokalen Nummern — sie ändern sich. Google Maps zeigt immer die aktuelle Nummer!
        </div>
      </div>

      {/* 3. BUNDESWEITE HOTLINES — verifiziert */}
      <div style={{background:C.greenL,border:`2px solid #86EFAC`,borderRadius:20,padding:"16px"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#064E3B",marginBottom:12}}>
          ✅ Bundesweite Hotlines — immer korrekt:
        </div>
        {beh.bundesHotlines.map((h,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:"14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.ink}}>{h.n}</div>
              <div style={{fontSize:12,color:C.gray,marginTop:2,lineHeight:1.4}}>{h.info}</div>
            </div>
            <a href={`tel:${h.tel.replace(/\s/g,"")}`}
              style={{background:C.green,color:"white",borderRadius:10,padding:"10px 16px",fontSize:16,fontWeight:800,textDecoration:"none",flexShrink:0}}>
              {h.tel}
            </a>
          </div>
        ))}
        {/* Immer: Bürgertelefon 115 */}
        <div style={{background:"white",borderRadius:14,padding:"14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:C.ink}}>Bürgertelefon — alle Behörden</div>
            <div style={{fontSize:12,color:C.gray,marginTop:2}}>Kostenlos • Mo-Fr 8–18 Uhr • Verbindet weiter!</div>
          </div>
          <a href="tel:115"
            style={{background:C.blue,color:"white",borderRadius:10,padding:"10px 16px",fontSize:20,fontWeight:900,textDecoration:"none",flexShrink:0}}>
            115
          </a>
        </div>
      </div>

      {/* 4. ONLINE ERLEDIGEN */}
      <a href={beh.onlineLink} target="_blank" rel="noreferrer"
        style={{display:"flex",alignItems:"center",gap:12,background:C.blueL,border:`2px solid ${C.blue}`,borderRadius:18,padding:"16px",fontSize:16,fontWeight:800,color:C.blue,textDecoration:"none"}}>
        <span style={{fontSize:26}}>💻</span>
        <span style={{flex:1}}>{beh.onlineText}</span>
        <span style={{fontSize:18}}>↗</span>
      </a>

      {/* 5. BRIEF SCHREIBEN */}
      {onSelectBehoerde && (
        <button onClick={()=>onSelectBehoerde(beh, stadt, bundesland)}
          style={{width:"100%",padding:"20px",background:C.goldL,border:`2px solid ${C.gold}`,borderRadius:20,fontSize:18,fontWeight:800,color:"#78350F",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span style={{fontSize:26}}>✍️</span>
          Brief an {beh.name} in {stadt} schreiben
        </button>
      )}
    </div>
  );

  // ── ERGEBNISSE ────────────────────────────────────────────────────────────
  if (gesucht) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Stadt Badge */}
      <div style={{background:`linear-gradient(135deg,${C.blueD},${C.blue})`,borderRadius:22,padding:"18px 20px",color:"white",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:13,opacity:.7,fontWeight:600,marginBottom:2}}>Behörden in:</div>
          <div style={{fontSize:26,fontWeight:900}}>📍 {stadt}</div>
          {bundesland&&<div style={{fontSize:14,opacity:.8,marginTop:2}}>{bundesland}</div>}
        </div>
        <button onClick={reset}
          style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.3)",borderRadius:12,padding:"10px 16px",color:"white",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"inherit"}}>
          ✏️ Ändern
        </button>
      </div>

      {/* Info-Box */}
      <div style={{background:C.goldL,border:`2px solid #FDE68A`,borderRadius:16,padding:"12px 14px",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:18,flexShrink:0}}>ℹ️</span>
        <div style={{fontSize:13,color:"#78350F",lineHeight:1.55,fontWeight:600}}>
          Tippen Sie auf eine Behörde — Sie bekommen den direkten Such-Link für <strong>{stadt}</strong> und alle Online-Dienste.
          <br/>📞 Lokale Nummern finden Sie über Google Maps — so ist die Nummer immer aktuell!
        </div>
      </div>

      {/* Behörden Liste */}
      <div style={{fontSize:18,fontWeight:900,color:C.ink}}>Behörden in {stadt}:</div>
      {behoerden.map((b,i)=>(
        <button key={i} onClick={()=>setSelBeh(b.name)}
          style={{background:"white",border:`2px solid ${C.border}`,borderRadius:22,padding:"18px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,textAlign:"left",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,.05)"}}>
          <div style={{width:64,height:64,background:b.farbeL,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,border:`2px solid ${b.farbe}33`}}>
            {b.icon}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:900,color:C.ink}}>{b.name}</div>
            <div style={{fontSize:13,color:C.gray,marginTop:3,lineHeight:1.4}}>{b.was}</div>
            <div style={{background:b.farbeL,color:b.farbe,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700,display:"inline-block",marginTop:6}}>
              🔍 In {stadt} suchen →
            </div>
          </div>
          <span style={{fontSize:26,color:C.gray}}>›</span>
        </button>
      ))}

      {/* Direkt online */}
      <div style={{background:C.grayL,border:`2px solid ${C.border}`,borderRadius:20,padding:"16px"}}>
        <div style={{fontSize:16,fontWeight:800,marginBottom:12,color:C.ink}}>⚡ Direkt online erledigen</div>
        {[
          {n:"Bürgergeld online beantragen",     ico:"💶",l:"https://www.jobcenter.digital"},
          {n:"Kindergeld online beantragen",     ico:"👶",l:"https://www.arbeitsagentur.de/kindergeld-online"},
          {n:"Steuererklärung online (ELSTER)",  ico:"📊",l:"https://www.elster.de"},
          {n:`Integrationskurs in ${stadt}`,     ico:"🗣️",l:`https://bamf-navi.bamf.de/de/Themen/Integrationskurse/?ort=${encodeURIComponent(stadt)}`},
        ].map((x,i)=>(
          <a key={i} href={x.l} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",textDecoration:"none"}}>
            <span style={{fontSize:22,width:32,textAlign:"center"}}>{x.ico}</span>
            <span style={{fontSize:15,fontWeight:700,color:C.blue,flex:1}}>{x.n}</span>
            <span style={{fontSize:16,color:C.gray}}>↗</span>
          </a>
        ))}
      </div>

      {/* Bürgertelefon 115 */}
      <div style={{background:C.greenL,border:`2px solid #86EFAC`,borderRadius:18,padding:"16px",textAlign:"center"}}>
        <div style={{fontSize:15,fontWeight:700,color:"#064E3B",marginBottom:6}}>
          📞 Alle Behörden — eine Nummer
        </div>
        <a href="tel:115" style={{fontSize:36,fontWeight:900,color:C.green,textDecoration:"none",display:"block",marginBottom:4}}>115</a>
        <div style={{fontSize:13,color:"#059669",marginBottom:12}}>Bürgertelefon • Kostenlos • Mo-Fr 8–18 Uhr</div>
        <a href="tel:115" style={{background:C.green,color:"white",borderRadius:14,padding:"12px 24px",fontSize:17,fontWeight:800,textDecoration:"none",display:"inline-block"}}>
          📞 115 anrufen
        </a>
      </div>
    </div>
  );

  // ── STARTSEITE mit STADTSUCHE ─────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Titel */}
      <div style={{background:`linear-gradient(135deg,${C.blueD},${C.blue})`,borderRadius:24,padding:"28px 20px",color:"white",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>📍</div>
        <div style={{fontSize:26,fontWeight:900,marginBottom:8}}>Behörde in Ihrer Stadt finden</div>
        <div style={{fontSize:16,opacity:.85,lineHeight:1.65}}>
          Stadt eingeben → alle Behörden mit<br/>direkten Such-Links für Ihre Stadt!
        </div>
      </div>

      {/* STADTSUCHE */}
      <div style={{background:"white",border:`3px solid ${C.blue}`,borderRadius:24,padding:"22px 18px",boxShadow:`0 4px 20px ${C.blue}22`}}>
        <div style={{fontSize:20,fontWeight:900,color:C.ink,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:28}}>🏙️</span>
          In welcher Stadt wohnen Sie?
        </div>

        <input
          value={stadt}
          onChange={e=>setStadt(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") suchen(); }}
          placeholder="Stadt eingeben z.B. Braunschweig..."
          autoFocus
          style={{width:"100%",border:`3px solid ${C.blue}`,borderRadius:18,padding:"20px",fontSize:22,fontFamily:"inherit",color:C.ink,outline:"none",marginBottom:12,boxSizing:"border-box",background:"#F8FAFF"}}
        />

        <select value={bundesland} onChange={e=>setBl(e.target.value)}
          style={{width:"100%",border:`2px solid ${C.border}`,borderRadius:16,padding:"16px",fontSize:18,fontFamily:"inherit",color:bundesland?C.ink:C.gray,background:"white",outline:"none",marginBottom:16,boxSizing:"border-box"}}>
          <option value="">— Bundesland (optional) —</option>
          {BUNDESLAENDER.map(bl=><option key={bl} value={bl}>{bl}</option>)}
        </select>

        <button onClick={suchen} disabled={stadt.trim().length<2}
          style={{width:"100%",padding:"22px",background:stadt.trim().length<2?"#D1D5DB":C.blue,color:stadt.trim().length<2?"#9CA3AF":"white",border:"none",borderRadius:20,fontSize:22,fontWeight:900,cursor:stadt.trim().length<2?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:stadt.trim().length<2?"none":`0 8px 24px ${C.blue}44`,transition:"all .2s"}}>
          <span style={{fontSize:28}}>🔍</span>
          Behörden in {stadt.trim()||"meiner Stadt"} finden
        </button>
      </div>

      {/* Bundesland Hinweise */}
      {bundesland==="Berlin"&&<div style={{background:"#FEF2F2",border:"2px solid #FCA5A5",borderRadius:16,padding:"14px 16px",display:"flex",gap:10}}><span style={{fontSize:20}}>⚠️</span><div style={{fontSize:14,color:"#991B1B",fontWeight:600,lineHeight:1.6}}>In Berlin heißt es <strong>LABo (Landesamt für Einwanderung)</strong> — nicht Ausländerbehörde!</div></div>}
      {bundesland==="Hamburg"&&<div style={{background:"#FEF2F2",border:"2px solid #FCA5A5",borderRadius:16,padding:"14px 16px",display:"flex",gap:10}}><span style={{fontSize:20}}>⚠️</span><div style={{fontSize:14,color:"#991B1B",fontWeight:600,lineHeight:1.6}}>In Hamburg heißt es <strong>Einwanderungsbehörde</strong> — nicht Ausländerbehörde!</div></div>}

      {/* Bürgertelefon 115 */}
      <div style={{background:C.greenL,border:`2px solid #86EFAC`,borderRadius:20,padding:"18px",textAlign:"center"}}>
        <div style={{fontSize:16,fontWeight:800,color:"#064E3B",marginBottom:6}}>📞 Nicht sicher welche Behörde?</div>
        <div style={{fontSize:14,color:"#059669",marginBottom:10}}>Bürgertelefon 115 — kostenlos, verbindet Sie direkt!</div>
        <a href="tel:115" style={{display:"inline-flex",alignItems:"center",gap:10,background:C.green,color:"white",borderRadius:16,padding:"14px 28px",fontSize:20,fontWeight:900,textDecoration:"none"}}>
          📞 115 anrufen — kostenlos
        </a>
      </div>

    </div>
  );
}
