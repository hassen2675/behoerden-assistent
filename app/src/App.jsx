import { useState, useRef, useCallback } from "react";

const LANGS = [
  { code:"de", label:"Deutsch", flag:"🇩🇪", dir:"ltr" },
  { code:"en", label:"English", flag:"🇬🇧", dir:"ltr" },
  { code:"ar", label:"عربي", flag:"🇸🇦", dir:"rtl" },
  { code:"tr", label:"Türkçe", flag:"🇹🇷", dir:"ltr" },
];

const UI = {
  de: {
    appSub: "KI-Assistent für Ausländer in Deutschland",
    tab1: "Brief", tab2: "Chat", tab3: "Formular",
    chatHello: "Hallo! 👋\n\nWie kann ich Ihnen helfen?",
    chatPlaceholder: "Hier schreiben...",
    chatError: "Verbindungsfehler",
  },
  en: {
    appSub: "AI assistant for foreigners in Germany",
    tab1: "Letter", tab2: "Chat", tab3: "Form",
    chatHello: "Hello! 👋\n\nHow can I help you?",
    chatPlaceholder: "Write here...",
    chatError: "Connection error",
  },
  ar: {
    appSub: "مساعد ذكاء اصطناعي للأجانب في ألمانيا",
    tab1: "رسالة", tab2: "محادثة", tab3: "نموذج",
    chatHello: "مرحبا! 👋\n\nكيف يمكنني مساعدتك؟",
    chatPlaceholder: "اكتب هنا...",
    chatError: "خطأ في الاتصال",
  },
  tr: {
    appSub: "Almanya'daki yabancılar için yapay zeka asistanı",
    tab1: "Mektup", tab2: "Sohbet", tab3: "Form",
    chatHello: "Merhaba! 👋\n\nSize nasıl yardımcı olabilirim?",
    chatPlaceholder: "Buraya yazın...",
    chatError: "Bağlantı hatası",
  },
};

function getUI(lang) { return UI[lang] || UI.de; }
function getLang(code) { return LANGS.find(l => l.code === code) || LANGS[0]; }

async function callClaude(messages, system, maxTokens = 1200) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!r.ok) throw new Error(`${r.status}`);
  const d = await r.json();
  return d.content?.map(c => c.text || "").join("") || "";
}

const T = {
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  brand: "#0F172A",
  accent: "#3B82F6",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkMute: "#94A3B8",
  border: "#E2E8F0",
  borderL: "#F1F5F9",
};

function ChatTab({ lang }) {
  const ln = getLang(lang);
  const u = getUI(lang);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: u.chatHello }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: userMsg }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const r = await callClaude(
        newMsgs.filter((m, i) => i > 0).map(m => ({ role: m.role, content: m.content })),
        `Du bist ein freundlicher Helfer für Ausländer in Deutschland. Antworte auf ${ln.label}.`,
        1400
      );
      setMsgs([...newMsgs, { role: "assistant", content: r }]);
    } catch (e) {
      setMsgs([...newMsgs, { role: "assistant", content: u.chatError + ": " + e.message }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 500, overflowY: "auto", padding: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: m.role === "user" ? T.brand : T.borderL,
            color: m.role === "user" ? "white" : T.ink,
            padding: "12px 16px",
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            fontSize: 15,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            direction: ln.dir,
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: "flex-start",
            background: T.borderL,
            padding: "14px 18px",
            borderRadius: "18px 18px 18px 4px",
            display: "flex",
            gap: 6,
          }}>
            {[0, 0.15, 0.3].map(d => (
              <span key={d} style={{
                width: 8, height: 8,
                background: T.inkMute,
                borderRadius: "50%",
                animation: `bounce 1.2s ${d}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{
        borderTop: `1px solid ${T.border}`,
        padding: 12,
        display: "flex",
        gap: 10,
        background: T.bg,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={u.chatPlaceholder}
          style={{
            flex: 1,
            background: "white",
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 15,
            outline: "none",
            fontFamily: "inherit",
            direction: ln.dir,
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 44,
            height: 44,
            background: T.brand,
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 18,
            cursor: "pointer",
            opacity: loading || !input.trim() ? 0.4 : 1,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("chat");
  const [lang, setLang] = useState("de");
  const [showLP, setShowLP] = useState(false);
  const ln = getLang(lang);
  const u = getUI(lang);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Inter Tight', sans-serif",
      maxWidth: 520,
      margin: "0 auto",
      direction: ln.dir,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${T.bg}; font-family: 'Inter Tight', sans-serif; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        button:active { transform: scale(0.97); }
      `}</style>

      <div style={{
        background: "white",
        borderBottom: `1px solid ${T.border}`,
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: T.brand,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}>🇩🇪</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Behörden Assistent</div>
            <div style={{ fontSize: 11, color: T.inkMute }}>{u.appSub}</div>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowLP(!showLP)}
            style={{
              background: "white",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 14,
              fontWeight: 600,
              color: T.ink,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {ln.flag} {ln.label} ▾
          </button>
          {showLP && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "white",
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 6,
              minWidth: 160,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 200,
            }}>
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setShowLP(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    background: lang === l.code ? T.borderL : "transparent",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 14,
                    color: T.ink,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: lang === l.code ? 700 : 500,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 14px" }}>
        <ChatTab lang={lang} />
      </div>

      <div style={{
        textAlign: "center",
        padding: 12,
        color: T.inkMute,
        fontSize: 11,
      }}>
        KI-generiert — vor dem Absenden prüfen
      </div>
    </div>
  );
}
