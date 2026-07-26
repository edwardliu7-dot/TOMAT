import React, { useState } from "react";
import { PenSquare, MessageCircle, Home, Map, Trophy, User, Send } from "lucide-react";

export default function ChatMobile() {
  const [activeTab, setActiveTab] = useState("Pesan Privat");
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");

  const privates = [
    { id: "guru-sari", init: "BS", name: "Bu Sari", role: "Guru", msg: "Ahmad, tugas halaman 42 sudah dikumpulkan?", time: "09:41", unread: 2, color: "from-indigo-500 to-violet-600" },
    { id: "rina", init: "R", name: "Rina", role: null, msg: "Kamu ada catatan Aljabar bab 3 gak?", time: "Kemarin", unread: 0, color: "from-orange-400 to-amber-500" },
    { id: "dimas", init: "D", name: "Dimas", role: null, msg: "Mabar Katak Pelompat jam 8 malem ya wkwk", time: "Senin", unread: 0, color: "from-orange-400 to-amber-500" },
    { id: "siti", init: "S", name: "Siti", role: null, msg: "Oke deh siap!", time: "Minggu", unread: 0, color: "from-orange-400 to-amber-500" },
    { id: "pak-budi", init: "PB", name: "Pak Budi", role: "Guru", msg: "Terima kasih atas partisipasinya, Ahmad.", time: "12 Okt", unread: 0, color: "from-cyan-500 to-blue-600" },
  ];

  const forumTopics = [
    { title: "Bagaimana cara soal Pythagoras no.5?", author: "Rio K.", replies: 8, time: "2 jam lalu", pinned: true },
    { title: "Ada yang bisa bantu soal SPLDV?", author: "Dewi P.", replies: 3, time: "5 jam lalu", pinned: false },
    { title: "Turnamen minggu depan kapan?", author: "Budi S.", replies: 12, time: "1 hari lalu", pinned: false },
  ];

  if (openChat) {
    const chat = privates.find(p => p.id === openChat)!;
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex flex-col">
        <div className="sticky top-0 z-20 bg-[#071321]/95 backdrop-blur-xl border-b border-indigo-500/[0.08] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpenChat(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/15 bg-[#0E1E35] text-indigo-300">
            ←
          </button>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${chat.color} font-bold text-[13px] text-white`}>
            {chat.init}
          </div>
          <div>
            <div className="font-bold text-[14px]">{chat.name}</div>
            {chat.role && <div className="text-[10px] text-indigo-300">{chat.role}</div>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-[16px] rounded-tl-sm bg-[#0E1E35] border border-indigo-500/[0.10] px-4 py-3 text-[13px] shadow-sm">
              {chat.msg}
              <div className="text-[9px] text-[#4B6480] mt-1 text-right">{chat.time}</div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-[16px] rounded-tr-sm bg-indigo-500 px-4 py-3 text-[13px] shadow-sm">
              Sudah Bu, saya kumpulkan tadi pagi 😊
              <div className="text-[9px] text-indigo-200 mt-1 text-right">09:44 ✓✓</div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-[16px] rounded-tl-sm bg-[#0E1E35] border border-indigo-500/[0.10] px-4 py-3 text-[13px] shadow-sm">
              Oke ya, ibu cek dulu nanti 👍
              <div className="text-[9px] text-[#4B6480] mt-1 text-right">09:45</div>
            </div>
          </div>
        </div>
        <div className="px-4 pb-6 pt-2 border-t border-indigo-500/[0.08] bg-[#071321]/95">
          <div className="flex items-center gap-2">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-[12px] border border-indigo-500/[0.15] bg-[#0E1E35] px-4 py-3 text-[13px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/40"
            />
            <button className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.10] blur-[120px]" />
        <div className="absolute -right-40 top-[40%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.07] blur-[140px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="px-4 pt-5 pb-2 bg-[#071321]/95 backdrop-blur-xl border-b border-indigo-500/[0.08]">
          <h1 className="text-[20px] font-black tracking-tight">Chat & Forum 💬</h1>
          <div className="mt-3 flex bg-[#0A1628] rounded-[12px] p-1 shadow-inner border border-indigo-500/[0.06]">
            {["Pesan Privat", "Forum Kelas"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[13px] rounded-[10px] font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#0E1E35] text-white shadow-sm border border-indigo-500/[0.10]"
                    : "text-[#4B6480] hover:text-indigo-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-3 space-y-2">
          {activeTab === "Pesan Privat" && (
            <>
              {privates.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setOpenChat(chat.id)}
                  className="flex items-center gap-3 rounded-[16px] bg-[#0E1E35] border border-indigo-500/[0.08] px-3 py-3 active:border-indigo-500/30 transition-colors cursor-pointer"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${chat.color} font-black text-[14px] text-white shadow-sm`}>
                    {chat.init}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-0.5">
                      <span className="font-bold text-[14px]">
                        {chat.name}
                        {chat.role && <span className="text-indigo-300 font-normal text-[11px] ml-1">({chat.role})</span>}
                      </span>
                      <span className="text-[10px] text-[#4B6480]">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[11px] text-[#4B6480] truncate">{chat.msg}</span>
                      {chat.unread > 0 && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-black text-white">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "Forum Kelas" && (
            <div className="space-y-2.5">
              {forumTopics.map((topic, i) => (
                <div key={i} className="rounded-[16px] bg-[#0E1E35] border border-indigo-500/[0.08] p-4 cursor-pointer hover:border-indigo-500/20 transition-colors">
                  {topic.pinned && (
                    <div className="inline-block rounded bg-indigo-500/15 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-black text-indigo-300 mb-2">📌 DISEMATKAN</div>
                  )}
                  <h4 className="text-[14px] font-bold text-white mb-1">{topic.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-[#4B6480]">
                    <span>oleh {topic.author}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={10} /> {topic.replies} balasan · {topic.time}</span>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 rounded-[16px] border-2 border-dashed border-indigo-500/20 py-4 text-[13px] font-bold text-indigo-400/60 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
                <PenSquare size={16} /> Buat Topik Baru
              </button>
            </div>
          )}
        </div>

        {/* Floating compose button */}
        {activeTab === "Pesan Privat" && (
          <button className="fixed bottom-24 right-5 h-12 w-12 rounded-full bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center hover:-translate-y-1 active:translate-y-0 transition-all z-20">
            <PenSquare size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-around border-t border-indigo-500/[0.08] bg-[#071321]/95 pb-5 pt-2 backdrop-blur-xl">
          {[
            { emoji: "🏠", label: "Beranda" },
            { emoji: "🗺️", label: "Zona" },
            { emoji: "🏆", label: "Peringkat" },
            { emoji: "👤", label: "Profil" },
          ].map((item) => (
            <button key={item.label} className="relative flex flex-col items-center gap-1.5 p-2 w-16">
              <span className="text-[20px] opacity-35">{item.emoji}</span>
              <span className="text-[10px] text-[#4B6480]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
