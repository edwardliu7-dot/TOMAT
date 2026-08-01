import { useState } from "react";
import { PageShell } from "./_shared/Sidebar";
import { Search, Send, MessageCircle, ArrowLeft, CheckCheck, Inbox } from "lucide-react";

const CONVERSATIONS = [
  { id: "1", name: "Achmad Fauzi", kelas: "VIII Ibnu Sina", lastMsg: "Pak, boleh tanya soal PR?", lastAt: "10:32", unread: 2, role: "siswa" as const },
  { id: "2", name: "Bunga Pertiwi", kelas: "VIII Ibnu Sina", lastMsg: "Terima kasih pak 🙏", lastAt: "09:15", unread: 0, role: "siswa" as const },
  { id: "3", name: "Cahya Ramadhan", kelas: "VII Ibnu Batuttah", lastMsg: "Izin pak, besok saya sakit", lastAt: "Kemarin", unread: 1, role: "siswa" as const },
  { id: "4", name: "Dian Safitri", kelas: "VIII Ibnu Sina", lastMsg: "Pak, nilai UTS saya sudah keluar?", lastAt: "Kemarin", unread: 0, role: "siswa" as const },
  { id: "5", name: "Endra Wijaya", kelas: "IX Al Khawarizmi", lastMsg: "Sudah saya kerjakan pak", lastAt: "2 hari lalu", unread: 0, role: "siswa" as const },
];

const MESSAGES = [
  { id: 1, from: "siswa", text: "Pak, boleh tanya soal PR Matematika?", time: "10:20" },
  { id: 2, from: "guru", text: "Boleh, apa yang mau ditanyakan?", time: "10:22" },
  { id: 3, from: "siswa", text: "Nomor 5, cara mencari hipotenusa kalau 2 sisinya 3 dan 4?", time: "10:28" },
  { id: 4, from: "guru", text: "Pakai rumus Pythagoras ya: c² = a² + b² = 9 + 16 = 25, jadi c = 5.", time: "10:30" },
  { id: 5, from: "siswa", text: "Pak, boleh tanya soal PR?", time: "10:32", unread: true },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function KotakMasuk() {
  const [selected, setSelected] = useState<typeof CONVERSATIONS[0] | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = CONVERSATIONS.reduce((a, c) => a + c.unread, 0);

  return (
    <PageShell active="kotak-masuk" title="Kotak Masuk" badge={totalUnread}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Kotak Masuk</h1>
        <p className="text-sm text-slate-500 mt-1">Pesan dari siswa</p>
      </div>

      <div className="flex gap-5 h-[600px]">
        {/* Conversation list */}
        <div className="w-72 shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari siswa..."
                className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-50 transition-colors ${selected?.id === c.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-slate-800 truncate">{c.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{c.lastAt}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {c.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                  {initials(selected.name)}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{selected.name}</div>
                  <div className="text-xs text-slate-400">{selected.kelas}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {MESSAGES.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "guru" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      m.from === "guru"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      <p>{m.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${m.from === "guru" ? "text-blue-200" : "text-slate-400"}`}>
                        {m.time}
                        {m.from === "guru" && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  <button className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Pilih percakapan</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
