import React, { useState } from "react";
import { Home, Map, Trophy, BarChart2, ShoppingBag, Award, MessageCircle, PenSquare, Send, LogOut } from "lucide-react";

const NAV = [
  { icon: Home, label: "Beranda" },
  { icon: Map, label: "Zona Belajar" },
  { icon: BarChart2, label: "Nilai & Tugas" },
  { icon: Trophy, label: "Papan Peringkat" },
  { icon: ShoppingBag, label: "Toko" },
  { icon: Award, label: "Lencana" },
  { icon: MessageCircle, label: "Chat", active: true },
];

const privates = [
  { id: "guru-sari", init: "BS", name: "Bu Sari", role: "Guru", msg: "Ahmad, tugas halaman 42 sudah dikumpulkan?", time: "09:41", unread: 2, color: "from-indigo-500 to-violet-600" },
  { id: "rina", init: "R", name: "Rina", role: null, msg: "Kamu ada catatan Aljabar bab 3 gak?", time: "Kemarin", unread: 0, color: "from-orange-400 to-amber-500" },
  { id: "dimas", init: "D", name: "Dimas", role: null, msg: "Mabar Katak Pelompat jam 8 malem ya wkwk", time: "Senin", unread: 0, color: "from-orange-400 to-amber-500" },
  { id: "pak-budi", init: "PB", name: "Pak Budi", role: "Guru", msg: "Terima kasih atas partisipasinya, Ahmad.", time: "12 Okt", unread: 0, color: "from-cyan-500 to-blue-600" },
];

const forumTopics = [
  { title: "Bagaimana cara soal Pythagoras no.5?", author: "Rio K.", replies: 8, time: "2 jam lalu", pinned: true },
  { title: "Ada yang bisa bantu soal SPLDV?", author: "Dewi P.", replies: 3, time: "5 jam lalu", pinned: false },
  { title: "Turnamen minggu depan kapan?", author: "Budi S.", replies: 12, time: "1 hari lalu", pinned: false },
  { title: "Tips menghapal perkalian lebih cepat?", author: "Maya S.", replies: 6, time: "2 hari lalu", pinned: false },
];

const chatHistory = [
  { from: "them", text: "Ahmad, tugas halaman 42 sudah dikumpulkan?", time: "09:41" },
  { from: "me", text: "Sudah Bu, saya kumpulkan tadi pagi 😊", time: "09:44" },
  { from: "them", text: "Oke ya, ibu cek dulu nanti 👍", time: "09:45" },
  { from: "me", text: "Siap Bu! Kalau ada yang kurang saya revisi.", time: "09:46" },
];

export default function ChatWeb() {
  const [activeTab, setActiveTab] = useState("Pesan Privat");
  const [activeChat, setActiveChat] = useState("guru-sari");
  const [inputVal, setInputVal] = useState("");

  const currentChat = privates.find(p => p.id === activeChat);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#071321] text-white font-sans flex">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />
        <div className="absolute right-0 top-[30%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.05] blur-[150px]" />
      </div>

      {/* Sidebar nav */}
      <aside className="relative z-20 flex w-[220px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/80 backdrop-blur-xl shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-600">
              <span className="text-lg">🍅</span>
            </div>
            <div>
              <div className="font-black tracking-[0.16em] text-white text-[13px]">TOMAT</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Tantangan Otak Mat.</div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 py-2 space-y-0.5">
          <div className="mb-3 mt-1 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#4B6480]">Menu Utama</div>
          {NAV.map((item) => (
            <div key={item.label} className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-bold transition-all cursor-pointer ${(item as any).active ? "bg-indigo-500/[0.12] text-indigo-300 ring-1 ring-indigo-500/20" : "text-[#4B6480] hover:bg-white/[0.03] hover:text-white"}`}>
              <item.icon size={17} />
              {item.label}
              {item.label === "Chat" && (
                <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-black">2</div>
              )}
            </div>
          ))}
        </div>
        <div className="p-3 mt-auto border-t border-indigo-500/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-[10px] cursor-pointer hover:bg-white/[0.03]">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-[12px] font-black shrink-0">AF</div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[12px] font-bold">Ahmad Fauzi</div>
              <div className="truncate text-[10px] text-[#4B6480]">IX Al Khawarizmi</div>
            </div>
            <button className="text-[#4B6480] hover:text-red-400 shrink-0"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      {/* Chat list panel */}
      <div className="relative z-10 flex w-[300px] flex-col border-r border-indigo-500/[0.08] bg-[#0A1628]/50 backdrop-blur-sm shrink-0">
        <div className="px-4 py-4 border-b border-indigo-500/[0.08]">
          <h2 className="text-[17px] font-black mb-3">Chat & Forum 💬</h2>
          <div className="flex bg-[#071321] rounded-[12px] p-1 border border-indigo-500/[0.06]">
            {["Pesan Privat", "Forum Kelas"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[12px] font-bold rounded-[10px] transition-all ${
                  activeTab === tab ? "bg-[#0E1E35] text-white border border-indigo-500/[0.10]" : "text-[#4B6480] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {activeTab === "Pesan Privat" ? (
            <div className="space-y-1 px-2">
              {privates.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`flex items-center gap-3 rounded-[12px] px-3 py-3 cursor-pointer transition-colors ${activeChat === chat.id ? "bg-indigo-500/[0.10] border border-indigo-500/20" : "hover:bg-white/[0.03]"}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${chat.color} font-black text-[13px]`}>{chat.init}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-0.5">
                      <span className="font-bold text-[13px] truncate">{chat.name}{chat.role && <span className="text-indigo-300 font-normal text-[11px] ml-1">({chat.role})</span>}</span>
                      <span className="text-[10px] text-[#4B6480] shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-[#4B6480] truncate">{chat.msg}</span>
                      {chat.unread > 0 && <span className="flex h-4 w-4 shrink-0 ml-1 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-black">{chat.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 px-2">
              {forumTopics.map((topic, i) => (
                <div key={i} className="rounded-[12px] border border-indigo-500/[0.08] bg-[#0E1E35] p-3.5 cursor-pointer hover:border-indigo-500/20 transition-colors">
                  {topic.pinned && <div className="text-[9px] font-black text-indigo-300 mb-1.5">📌 DISEMATKAN</div>}
                  <h4 className="text-[12px] font-bold text-white mb-1">{topic.title}</h4>
                  <div className="text-[10px] text-[#4B6480]">{topic.author} · {topic.replies} balasan · {topic.time}</div>
                </div>
              ))}
              <div className="mx-1 rounded-[12px] border-2 border-dashed border-indigo-500/20 py-4 cursor-pointer hover:border-indigo-500/35 transition-colors flex items-center justify-center gap-2 text-[12px] font-bold text-indigo-400/50 hover:text-indigo-400">
                <PenSquare size={14} /> Buat Topik Baru
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeTab === "Pesan Privat" && currentChat ? (
        <main className="relative z-10 flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-indigo-500/[0.08] bg-[#071321]/80 backdrop-blur-xl">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${currentChat.color} font-bold text-[13px] shrink-0`}>{currentChat.init}</div>
            <div>
              <div className="font-bold text-[15px]">{currentChat.name}</div>
              {currentChat.role && <div className="text-[11px] text-indigo-300">{currentChat.role}</div>}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[65%] rounded-[18px] px-5 py-3.5 text-[14px] shadow-sm ${
                  msg.from === "me"
                    ? "rounded-tr-sm bg-indigo-500 text-white"
                    : "rounded-tl-sm bg-[#0E1E35] border border-indigo-500/[0.10] text-white"
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 text-right ${msg.from === "me" ? "text-indigo-200" : "text-[#4B6480]"}`}>{msg.time}{msg.from === "me" && " ✓✓"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-indigo-500/[0.08] bg-[#071321]/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-[14px] border border-indigo-500/[0.15] bg-[#0E1E35] px-5 py-3.5 text-[14px] text-white placeholder-[#4B6480] outline-none focus:border-indigo-500/40 transition-all"
              />
              <button className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 transition-all">
                <Send size={20} />
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center text-[#4B6480]">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <div className="text-[15px] font-bold text-white/50">Pilih percakapan untuk memulai</div>
          </div>
        </main>
      )}
    </div>
  );
}
