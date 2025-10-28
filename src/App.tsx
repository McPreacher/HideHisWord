import React, { useEffect, useMemo, useState } from "react";
import { Home, Settings } from "lucide-react";

const LS_KEYS = {
  checks: "hhw_nt_checks_v1",
  theme: "hhw_nt_theme_v1",
  streak: "hhw_nt_streak_v1",
};

const THEMES = {
  Emerald: { bg: "bg-emerald-900", card: "bg-emerald-100 text-emerald-900", accent: "bg-emerald-600" },
  Indigo: { bg: "bg-indigo-900", card: "bg-indigo-100 text-indigo-900", accent: "bg-indigo-600" },
  Amber: { bg: "bg-amber-900", card: "bg-amber-100 text-amber-900", accent: "bg-amber-600" },
  Rose: { bg: "bg-rose-900", card: "bg-rose-100 text-rose-900", accent: "bg-rose-600" },
  Slate: { bg: "bg-slate-900", card: "bg-slate-100 text-slate-900", accent: "bg-slate-700" },
  Sky: { bg: "bg-sky-900", card: "bg-sky-100 text-sky-900", accent: "bg-sky-600" },
  Violet: { bg: "bg-violet-900", card: "bg-violet-100 text-violet-900", accent: "bg-violet-600" },
  Lime: { bg: "bg-lime-900", card: "bg-lime-100 text-lime-900", accent: "bg-lime-600" },
  Orange: { bg: "bg-orange-900", card: "bg-orange-100 text-orange-900", accent: "bg-orange-600" },
} as const;

const BOOKS = [
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 }, { name: "Luke", chapters: 24 }, { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 }, { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 }, { name: "Ephesians", chapters: 6 }, { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 }, { name: "1 Timothy", chapters: 6 }, { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 }, { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 }, { name: "2 Peter", chapters: 3 }, { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 }, { name: "Revelation", chapters: 22 }
] as const;

type BookName = typeof BOOKS[number]["name"];

// Exact NT verse counts per chapter
const NT_COUNTS: Record<BookName, number[]> = {
  Matthew: [25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],
  Mark:    [45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],
  Luke:    [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],
  John:    [51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],
  Acts:    [26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,40,38,40,30,35,27,27,32,44,31],
  Romans:  [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],
  "1 Corinthians": [31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24],
  "2 Corinthians": [24,17,18,18,21,18,16,24,15,18,33,21,13],
  Galatians: [24,21,29,31,26,18],
  Ephesians: [23,22,21,32,33,24],
  Philippians: [30,30,21,23],
  Colossians: [29,23,25,18],
  "1 Thessalonians": [10,20,13,18,28],
  "2 Thessalonians": [12,17,18],
  "1 Timothy": [20,15,16,16,25,21],
  "2 Timothy": [18,26,17,22],
  Titus: [16,15,15],
  Philemon: [25],
  Hebrews: [14,18,19,16,14,20,28,13,28,39,40,29,25],
  James: [27,26,18,17,20],
  "1 Peter": [25,25,22,19,14],
  "2 Peter": [21,22,18],
  "1 John": [10,29,24,21,21],
  "2 John": [13],
  "3 John": [15],
  Jude: [25],
  Revelation: [20,29,22,11,14,17,17,13,21,11,19,18,18,20,8,21,18,24,21,15,27,21],
};

function refKey(book: string, chapter: number, verse: number) {
  return `${book} ${chapter}:${verse}`;
}

function todayStr() { return new Date().toISOString().slice(0,10); }

export default function HideHisWordApp() {
  const [theme, setTheme] = useState<keyof typeof THEMES>(() => (localStorage.getItem(LS_KEYS.theme) as keyof typeof THEMES) || "Emerald");
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.checks) || '{}'); } catch { return {}; }
  });
  const [streak, setStreak] = useState<{count:number; last:string|null}>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.streak) || '{"count":0,"last":null}'); } catch { return { count: 0, last: null }; }
  });
  const [page, setPage] = useState<{ view: 'books' | 'chapters' | 'verses'; bookIndex: number | null; chapter: number | null}>({ view: "books", bookIndex: null, chapter: null });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => localStorage.setItem(LS_KEYS.theme, theme), [theme]);
  useEffect(() => localStorage.setItem(LS_KEYS.checks, JSON.stringify(checks)), [checks]);
  useEffect(() => localStorage.setItem(LS_KEYS.streak, JSON.stringify(streak)), [streak]);

  const themeObj = THEMES[theme];

  function versesInChapter(bookIndex: number, chapter: number) {
    const book = BOOKS[bookIndex];
    const arr = NT_COUNTS[book.name as BookName];
    const preset = arr && arr[chapter - 1];
    return typeof preset === 'number' ? preset : 40;
  }

  function isBookComplete(bookIndex: number, state: Record<string, boolean> = checks) {
    const b = BOOKS[bookIndex];
    for (let ch = 1; ch <= b.chapters; ch++) {
      const vCount = versesInChapter(bookIndex, ch);
      for (let v = 1; v <= vCount; v++) {
        if (!state[refKey(b.name, ch, v)]) return false;
      }
    }
    return true;
  }

  function toggleVerse(bookIndex: number, chapter: number, verse: number) {
    const key = refKey(BOOKS[bookIndex].name, chapter, verse);
    setChecks(prev => {
      const was = !!prev[key];
      const next = { ...prev, [key]: !was };
      return next;
    });
    // streak: increment only once per day when checking (not unchecking)
    setStreak(s => (s.last === todayStr() ? s : { count: s.count + 1, last: todayStr() }));
  }

  // ---------- Progress helpers ----------
  const overall = useMemo(() => {
    let done = 0, total = 0;
    BOOKS.forEach((b, bi) => {
      for (let ch = 1; ch <= b.chapters; ch++) {
        const vCount = versesInChapter(bi, ch);
        total += vCount;
        for (let v = 1; v <= vCount; v++) if (checks[refKey(b.name, ch, v)]) done++;
      }
    });
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }, [checks]);

  function bookProgress(bookIndex: number) {
    const b = BOOKS[bookIndex];
    let done = 0, total = 0;
    for (let ch = 1; ch <= b.chapters; ch++) {
      const vCount = versesInChapter(bookIndex, ch);
      total += vCount;
      for (let v = 1; v <= vCount; v++) if (checks[refKey(b.name, ch, v)]) done++;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, total, pct };
  }

  // ---------- UI: Header & Settings ----------
  function Header() {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setPage({ view: 'books', bookIndex: null, chapter: null })} className="bg-black/30 p-2 rounded-full hover:bg-black/40" title="Home">
            <Home className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold">Hide His Word</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${themeObj.card}`}>
            {overall.pct}% • Streak {streak.count}🔥
          </div>
          <button onClick={() => setShowSettings(true)} className="bg-black/30 p-2 rounded-full hover:bg-black/40" title="Settings">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  function SettingsModal() {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowSettings(false)} />
        <div className={`relative z-10 w-[min(92vw,480px)] rounded-2xl p-4 ${themeObj.card} shadow-xl`}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-extrabold">Settings</div>
            <button onClick={() => setShowSettings(false)} className="text-sm font-bold underline">Close</button>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-bold opacity-70 mb-1">Theme</div>
              <select value={theme} onChange={e => setTheme(e.target.value as keyof typeof THEMES)} className="w-full rounded-xl px-3 py-2 text-black">
                {Object.keys(THEMES).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button onClick={() => setShowSettings(false)} className="bg-black/30 px-4 py-2 rounded font-bold">Done</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Pages ----------
  function BooksPage() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-4">
        {BOOKS.map((b, i) => {
          const p = bookProgress(i);
          const completed = p.pct === 100;
          return (
            <button
              key={b.name}
              onClick={() => setPage({ view: 'chapters', bookIndex: i, chapter: null })}
              className={`relative rounded-2xl p-4 text-left shadow transition ${completed ? 'bg-gradient-to-br from-green-100 to-white text-green-900 ring-4 ring-green-400/40 border-2 border-green-600' : themeObj.card}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-black">{b.name}</div>
                  <div className="text-xs opacity-80">{b.chapters} chapters</div>
                </div>
                {completed && <div className="text-green-700 font-bold text-sm">Complete</div>}
              </div>
              <div className="mt-2 w-full h-2 bg-black/10 rounded-full overflow-hidden">
                <div className={`${completed ? 'bg-green-600' : themeObj.accent} h-2`} style={{ width: `${p.pct}%` }} />
              </div>
              <div className="mt-1 text-xs font-bold opacity-90">{p.done}/{p.total} verses</div>
            </button>
          );
        })}
      </div>
    );
  }

  function ChaptersPage({ bookIndex }: { bookIndex: number }) {
    const b = BOOKS[bookIndex];
    return (
      <div className="mt-4">
        <div className={`rounded-2xl p-4 ${themeObj.card} flex items-center justify-between gap-3`}>
          <div className="text-lg font-extrabold">{b.name}</div>
          <button onClick={() => setPage({ view: 'books', bookIndex: null, chapter: null })} className="text-sm font-bold underline">Back</button>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mt-4">
          {Array.from({ length: b.chapters }, (_, i) => i + 1).map(ch => {
            const vCount = versesInChapter(bookIndex, ch);
            const doneAll = Array.from({ length: vCount }, (_, vi) => checks[refKey(b.name, ch, vi+1)]).every(Boolean);
            return (
              <button
                key={ch}
                onClick={() => setPage({ view: 'verses', bookIndex, chapter: ch })}
                className={`rounded-lg p-2 font-extrabold border-2 ${doneAll ? 'bg-green-600 text-white border-transparent' : `${themeObj.card} border-black/20`}`}
                title={doneAll ? 'Completed' : 'Tap to open verses'}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function VersesPage({ bookIndex, chapter }: { bookIndex: number; chapter: number }) {
    const b = BOOKS[bookIndex];
    const count = versesInChapter(bookIndex, chapter);

    const checkedInChapter = Array.from({ length: count }, (_, i) => checks[refKey(b.name, chapter, i+1)]).filter(Boolean).length;

    function checkAllInChapter() {
      setChecks(prev => {
        const next = { ...prev } as Record<string, boolean>;
        for (let v = 1; v <= count; v++) next[refKey(b.name, chapter, v)] = true;
        return next;
      });
      setStreak(s => (s.last === todayStr() ? s : { count: s.count + 1, last: todayStr() }));
    }

    function uncheckAllInChapter() {
      setChecks(prev => {
        const next = { ...prev } as Record<string, boolean>;
        for (let v = 1; v <= count; v++) delete next[refKey(b.name, chapter, v)];
        return next;
      });
    }

    return (
      <div className="mt-4">
        <div className={`rounded-2xl p-4 ${themeObj.card} mb-3 flex items-center justify-between gap-3`}>
          <div className="font-extrabold">
            {b.name} {chapter} <span className="text-xs opacity-80 ml-2">{checkedInChapter}/{count} verses</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={checkAllInChapter} className={`${themeObj.accent} text-white font-black uppercase tracking-wide px-4 py-2 rounded-xl shadow-lg ring-2 ring-white/20 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-white/30`}>Check All</button>
            <button onClick={uncheckAllInChapter} className={`${themeObj.accent} text-white font-black uppercase tracking-wide px-4 py-2 rounded-xl shadow-lg ring-2 ring-white/20 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-white/30`}>Uncheck All</button>
            <button onClick={() => setPage({ view: 'chapters', bookIndex, chapter: null })} className="bg-black/20 text-white font-semibold px-4 py-2 rounded-lg border border-white/20 hover:bg-black/30 transition-all">Back</button>
          </div>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: count }, (_, i) => i + 1).map(v => (
            <button
              key={v}
              onClick={() => toggleVerse(bookIndex, chapter, v)}
              className={`rounded-lg p-2 font-extrabold border-2 ${checks[refKey(b.name, chapter, v)] ? 'bg-green-600 text-white border-transparent' : `${themeObj.card} border-black/20`}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- Main render ----------
  return (
    <div className={`${themeObj.bg} min-h-screen text-white p-6`}>
      <div className="max-w-6xl mx-auto">
        <Header />
        {page.view === 'books' && <BooksPage />}
        {page.view === 'chapters' && page.bookIndex !== null && <ChaptersPage bookIndex={page.bookIndex} />}
        {page.view === 'verses' && page.bookIndex !== null && page.chapter !== null && (
          <VersesPage bookIndex={page.bookIndex} chapter={page.chapter} />
        )}
      </div>
      <SettingsModal />
    </div>
  );
}
