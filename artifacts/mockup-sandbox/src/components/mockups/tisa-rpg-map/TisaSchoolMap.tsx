import { useState } from "react";
import { Castle, DoorOpen, Footprints, Info, Leaf, MapPin, Moon, Sparkles, Sun, Trees, Users } from "lucide-react";

type Room = { name: string; x: number; y: number; w: number; h: number; kind?: "room" | "stairs" | "outdoor" | "roof" };

const floors: Record<number, { subtitle: string; rooms: Room[] }> = {
  1: {
    subtitle: "Taman belajar, lapangan, dan sayap adik kecil",
    rooms: [
      { name: "Toilet Putra", x: 38, y: 34, w: 144, h: 38 }, { name: "Kelas SD", x: 38, y: 74, w: 144, h: 44 },
      { name: "Kelas SD", x: 38, y: 120, w: 144, h: 44 }, { name: "Kelas 1 Umar", x: 38, y: 166, w: 144, h: 54 },
      { name: "Kelas 1 Abu Bakar", x: 38, y: 222, w: 144, h: 54 }, { name: "Tangga ke lt2", x: 38, y: 278, w: 76, h: 32, kind: "stairs" },
      { name: "Tangga pendek", x: 38, y: 314, w: 144, h: 30, kind: "stairs" }, { name: "Toilet Putri", x: 8, y: 350, w: 86, h: 55 },
      { name: "UKS", x: 38, y: 350, w: 144, h: 62 }, { name: "TKB Mekkah", x: 38, y: 414, w: 144, h: 54 },
      { name: "TKA Istanbul", x: 38, y: 470, w: 144, h: 54 }, { name: "TKA Cordova", x: 38, y: 526, w: 144, h: 54 },
      { name: "Daycare Baby", x: 38, y: 582, w: 144, h: 54 }, { name: "Ruang admin", x: 38, y: 638, w: 144, h: 54 },
      { name: "Playground", x: 410, y: 28, w: 320, h: 94, kind: "outdoor" }, { name: "Gazebo", x: 632, y: 50, w: 72, h: 48, kind: "outdoor" },
      { name: "Lapangan Olahraga", x: 410, y: 134, w: 320, h: 240, kind: "outdoor" },
      { name: "Kelas 1 Said", x: 430, y: 396, w: 276, h: 70 }, { name: "TKB Madinah", x: 430, y: 468, w: 276, h: 70 },
      { name: "Daycare Siang", x: 430, y: 540, w: 276, h: 70 },
    ],
  },
  2: {
    subtitle: "Koridor tengah menghubungkan ruang putri, putra, dan perpustakaan",
    rooms: [
      { name: "Toilet Putri", x: 38, y: 30, w: 144, h: 42 }, ...["Kelas SD Putri", "Kelas SD Putri", "Kelas SD Putri", "Kelas SD Putri"].map((name, i) => ({ name, x: 38, y: 74 + i * 52, w: 144, h: 48 })),
      { name: "Tangga ke lt3", x: 38, y: 286, w: 82, h: 32, kind: "stairs" }, { name: "Ruang Guru", x: 38, y: 322, w: 144, h: 46 },
      { name: "Toilet Putra", x: 8, y: 392, w: 86, h: 56 }, { name: "Tangga dari lt1", x: 38, y: 396, w: 82, h: 32, kind: "stairs" },
      ...["Kelas SD Putra", "Kelas SD Putra", "Kelas SD Putra", "Kelas SD Putra", "Kelas SD Putra"].map((name, i) => ({ name, x: 38, y: 452 + i * 50, w: 144, h: 46 })),
      { name: "Ruang Kepsek SMP", x: 38, y: 704, w: 144, h: 52 }, { name: "Koridor utama", x: 184, y: 382, w: 260, h: 64, kind: "outdoor" },
      { name: "Mesjid", x: 470, y: 382, w: 238, h: 146, kind: "outdoor" }, { name: "Perpustakaan", x: 470, y: 532, w: 238, h: 92, kind: "outdoor" },
    ],
  },
  3: {
    subtitle: "Atap sekolah dan ruang eksplorasi untuk kakak-kakak",
    rooms: [
      { name: "Toilet Putri", x: 70, y: 30, w: 144, h: 34 }, { name: "Toilet Putra", x: 70, y: 66, w: 144, h: 34 },
      { name: "Ruang Ummi", x: 70, y: 102, w: 144, h: 40 }, { name: "Lab Komputer", x: 70, y: 144, w: 144, h: 40 },
      { name: "Kelas 9", x: 70, y: 186, w: 144, h: 60 }, { name: "Kelas 8", x: 70, y: 248, w: 144, h: 60 },
      { name: "Kelas 7", x: 70, y: 310, w: 144, h: 60 }, { name: "Tangga dari lt2", x: 70, y: 376, w: 82, h: 34, kind: "stairs" },
      { name: "Atap/Genteng", x: 70, y: 416, w: 144, h: 360, kind: "roof" },
    ],
  },
};

function Sprite({ npc = false }: { npc?: boolean }) {
  return <span className={npc ? "tisa-sprite npc" : "tisa-sprite"} aria-hidden="true"><span className="sprite-head" /><span className="sprite-body" /></span>;
}

function RoomTile({ room, active, onSelect }: { room: Room; active: boolean; onSelect: () => void }) {
  const outdoor = room.kind === "outdoor";
  return (
    <button onClick={onSelect} aria-label={`Buka ${room.name}`} className={`absolute group overflow-hidden border-2 border-[#172b3b] text-left transition-transform duration-200 hover:z-20 hover:scale-[1.035] focus:z-20 focus:outline-none focus:ring-4 focus:ring-[#f4c95d] ${active ? "ring-4 ring-[#f4c95d] z-10" : ""} ${outdoor ? "bg-[#2f8b82]" : room.kind === "roof" ? "bg-[#bd6b4d]" : room.kind === "stairs" ? "bg-[#85796b]" : "bg-[#e7c989]"}`} style={{ left: room.x, top: room.y, width: room.w, height: room.h }}>
      {!outdoor && room.kind !== "stairs" && room.kind !== "roof" && <span className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(90deg, transparent 46%, #b48758 47%, #b48758 50%, transparent 51%), linear-gradient(0deg, transparent 46%, #b48758 47%, #b48758 50%, transparent 51%)", backgroundSize: "18px 18px" }} />}
      {outdoor && <><span className="absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(#a7d69b 1.5px, transparent 1.5px)", backgroundSize: "17px 17px" }} /><Leaf className="absolute left-3 top-3 h-5 w-5 text-[#bde29b]" /><Leaf className="absolute bottom-3 right-3 h-5 w-5 text-[#bde29b]" /></>}
      {room.kind === "roof" && <span className="absolute inset-0 opacity-35" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 10px, #733e3c 10px 12px)" }} />}
      {room.kind === "stairs" && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black leading-none text-[#f5db96]" aria-hidden="true">⇅</span>}
      <span className="relative z-10 flex h-full items-center justify-center px-2 text-center text-[10px] font-bold leading-tight text-[#193243] drop-shadow-[0_1px_0_rgba(255,255,255,.25)] sm:text-[11px]">{room.name}</span>
      {active && <span className="absolute bottom-1 right-1 rounded bg-[#193243] px-1 text-[8px] text-[#f9e8b0]">jelajah</span>}
    </button>
  );
}

export function TisaSchoolMap() {
  const [floor, setFloor] = useState(1);
  const [selected, setSelected] = useState("Playground");
  const data = floors[floor];
  const selectedRoom = data.rooms.find((r) => r.name === selected);
  return (
    <main className="min-h-[100dvh] overflow-auto bg-[#101f35] p-3 font-['DM_Sans'] text-[#193243] sm:p-5">
      <style>{`.tisa-sprite{position:relative;display:inline-block;width:22px;height:30px;filter:drop-shadow(2px 2px 0 rgba(25,50,67,.45));}.tisa-sprite .sprite-head{position:absolute;left:6px;top:0;width:11px;height:11px;background:#e9b37a;border:2px solid #193243;border-radius:2px}.tisa-sprite .sprite-body{position:absolute;left:3px;top:10px;width:17px;height:18px;background:#a75a43;border:2px solid #193243;border-radius:3px 3px 1px 1px}.tisa-sprite.npc .sprite-body{background:#2f8b82}.tisa-sprite.npc .sprite-head{background:#c98d67}`}</style>
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[24px] border border-[#426079] bg-[#d8c595] shadow-[0_24px_70px_rgba(0,0,0,.4)]">
        <header className="flex flex-col gap-4 border-b-4 border-[#193243] bg-[#f3dfaa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#193243] bg-[#2f8b82] text-[#f5e4af] shadow-[3px_3px_0_#193243]"><Castle /></div><div><p className="text-[10px] font-black uppercase tracking-[.24em] text-[#a75a43]">SMARTISA • TOMAT</p><h1 className="font-['Space_Grotesk'] text-2xl font-black tracking-tight">Peta Sekolah TISA</h1><p className="text-xs font-semibold text-[#53645e]">{data.subtitle}</p></div></div>
          <div className="flex items-center gap-2"><Moon className="hidden h-4 w-4 text-[#a75a43] sm:block" /><span className="text-xs font-bold text-[#53645e]">Pilih lantai</span>{[1, 2, 3].map((n) => <button key={n} onClick={() => { setFloor(n); setSelected(floors[n].rooms[0].name); }} className={`rounded-lg border-2 border-[#193243] px-3 py-2 text-sm font-black shadow-[2px_2px_0_#193243] transition active:translate-x-[1px] active:translate-y-[1px] ${floor === n ? "bg-[#a75a43] text-[#fff1be]" : "bg-[#f8e9b5] text-[#193243]"}`}>Lantai {n}</button>)}</div>
        </header>
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_238px]">
          <section className="relative min-h-[700px] overflow-auto rounded-2xl border-4 border-[#193243] bg-[#c7b57b] p-3 shadow-inner">
            <div className="relative mx-auto h-[820px] w-[760px] rounded-xl border-4 border-[#193243] bg-[#91ad83]" style={{ backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.09) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.09) 75%), linear-gradient(45deg, rgba(255,255,255,.09) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.09) 75%)", backgroundPosition: "0 0, 12px 12px", backgroundSize: "24px 24px" }}>
              <div className="absolute left-4 top-3 flex items-center gap-2 rounded-full border-2 border-[#193243] bg-[#f3dfaa] px-3 py-1 text-[10px] font-black uppercase tracking-widest"><MapPin className="h-3 w-3 text-[#a75a43]" /> Lantai {floor}</div>
              {data.rooms.map((room, i) => <RoomTile key={`${room.name}-${i}`} room={room} active={selected === room.name} onSelect={() => setSelected(room.name)} />)}
              <div className="absolute left-[250px] top-[710px] flex gap-8"><Sprite /><Sprite npc /><Sprite npc /></div>
              <div className="absolute right-8 top-5 flex gap-3 text-[#315f56]"><Trees className="h-7 w-7" /><Trees className="h-6 w-6" /><Trees className="h-8 w-8" /></div>
              <div className="absolute bottom-4 right-4 rounded-lg border-2 border-[#193243] bg-[#f3dfaa] px-2 py-1 text-[9px] font-bold">← gunakan peta untuk menjelajah</div>
            </div>
          </section>
          <aside className="flex flex-col gap-3">
            <div className="rounded-2xl border-2 border-[#193243] bg-[#f3dfaa] p-4 shadow-[4px_4px_0_#193243]">
              <div className="mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#a75a43]" /><h2 className="font-['Space_Grotesk'] font-black">Zona terpilih</h2></div>
              <div className="rounded-xl border-2 border-[#193243] bg-[#ead29a] p-3"><div className="mb-2 flex items-center gap-2"><DoorOpen className="h-4 w-4 text-[#a75a43]" /><p className="font-black">{selectedRoom?.name}</p></div><p className="text-xs leading-relaxed text-[#53645e]">Pintu belajar terbuka. Klik ruang lain untuk memindahkan fokus jelajah.</p><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#193243] bg-[#2f8b82] px-3 py-2 text-xs font-black text-[#fff1be] shadow-[2px_2px_0_#193243]"><Footprints className="h-4 w-4" /> Mulai misi matematika</button></div>
            </div>
            <div className="rounded-2xl border-2 border-[#193243] bg-[#f3dfaa] p-4">
              <div className="mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-[#a75a43]" /><h2 className="font-['Space_Grotesk'] font-black">Legenda</h2></div>
              <div className="space-y-2 text-xs font-bold"><p className="flex items-center gap-2"><i className="h-4 w-4 rounded border-2 border-[#193243] bg-[#e7c989]" /> Ruang belajar</p><p className="flex items-center gap-2"><i className="h-4 w-4 rounded border-2 border-[#193243] bg-[#2f8b82]" /> Taman / area luar</p><p className="flex items-center gap-2"><i className="h-4 w-4 rounded border-2 border-[#193243] bg-[#85796b]" /> Tangga</p><p className="flex items-center gap-2"><Users className="h-4 w-4 text-[#a75a43]" /> Teman TOMAT</p></div>
            </div>
            <div className="mt-auto rounded-2xl border-2 border-[#193243] bg-[#193243] p-4 text-[#f3dfaa]"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"><Sun className="h-4 w-4 text-[#f4c95d]" /> Misi hari ini</div><p className="mt-2 font-['Space_Grotesk'] text-lg font-black">Temukan 3 ruang belajar.</p><div className="mt-3 h-2 rounded-full bg-[#53645e]"><div className="h-full w-1/3 rounded-full bg-[#f4c95d]" /></div><p className="mt-2 text-[10px] text-[#b7c6aa]">1 dari 3 zona terbuka</p></div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default TisaSchoolMap;