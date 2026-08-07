import { useEffect, useState } from "react";
import { DoorOpen, Leaf, Trees } from "lucide-react";

type Room = { name: string; x: number; y: number; w: number; h: number; kind?: "room" | "stairs" | "outdoor" | "roof" };

const rooms: Room[] = [
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
];

function Sprite({ npc = false }: { npc?: boolean }) {
  return <span className={npc ? "tisa-sprite npc" : "tisa-sprite"} aria-hidden="true"><span className="sprite-head" /><span className="sprite-body" /></span>;
}

function RoomTile({ room, active, onSelect }: { room: Room; active: boolean; onSelect: () => void }) {
  const outdoor = room.kind === "outdoor";
  return (
    <button onClick={onSelect} aria-label={`Buka ${room.name}`} className={`absolute group overflow-visible border-[3px] border-[#172b3b] text-left transition-transform duration-200 hover:z-20 hover:scale-[1.02] focus:z-20 focus:outline-none ${active ? "z-10 ring-2 ring-[#f5d36a]" : ""} ${outdoor ? "bg-[#2f8b82]" : room.kind === "roof" ? "bg-[#bd6b4d]" : room.kind === "stairs" ? "bg-[#85796b]" : "bg-[#e7c989]"}`} style={{ left: room.x, top: room.y, width: room.w, height: room.h }}>
      {!outdoor && room.kind !== "stairs" && room.kind !== "roof" && <span className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(90deg, transparent 46%, #b48758 47%, #b48758 50%, transparent 51%), linear-gradient(0deg, transparent 46%, #b48758 47%, #b48758 50%, transparent 51%)", backgroundSize: "18px 18px" }} />}
      {outdoor && <><span className="absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(#a7d69b 1.5px, transparent 1.5px)", backgroundSize: "17px 17px" }} /><Leaf className="absolute left-3 top-3 h-5 w-5 text-[#bde29b]" /><Leaf className="absolute bottom-3 right-3 h-5 w-5 text-[#bde29b]" /></>}
      {room.kind === "roof" && <span className="absolute inset-0 opacity-35" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 10px, #733e3c 10px 12px)" }} />}
      {room.kind === "stairs" && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black leading-none text-[#f5db96]" aria-hidden="true">⇅</span>}
      <span className="relative z-10 flex h-full items-center justify-center px-2 text-center text-[10px] font-bold leading-tight text-[#193243] drop-shadow-[0_1px_0_rgba(255,255,255,.25)] sm:text-[11px]">{room.name}</span>
      <span className="absolute -bottom-[5px] left-1/2 z-20 h-[8px] w-8 -translate-x-1/2 border-x-2 border-[#172b3b] bg-[#d8b978]" />
      {active && <span className="absolute -top-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap border-2 border-[#172b3b] bg-[#f4df9f] px-2 py-1 text-[9px] font-black text-[#193243] shadow-[2px_2px_0_#172b3b]"><DoorOpen className="mr-1 inline h-3 w-3" />{room.name}</span>}
    </button>
  );
}

function WorldDetails() {
  const windows = Array.from({ length: 10 });
  return <div className="pointer-events-none absolute inset-0 z-10">
    <div className="absolute left-5 top-5 flex gap-2 opacity-80"><Trees className="h-8 w-8 text-[#376b58]" /><Trees className="h-6 w-6 text-[#315f56]" /><span className="h-7 w-14 rounded-full border-2 border-[#315f56] bg-[#4d7d58]" /></div>
    <div className="absolute left-[220px] top-[60px] h-3 w-24 border-y-2 border-[#e0d49b] bg-[#6c8c65]" />
    <div className="absolute left-[222px] top-[88px] flex gap-2">{windows.slice(0, 5).map((_, i) => <i key={i} className="h-3 w-6 border-2 border-[#193243] bg-[#80b8a7]" />)}</div>
    <div className="absolute left-[216px] top-[270px] flex gap-2">{windows.slice(0, 4).map((_, i) => <i key={i} className="h-3 w-6 border-2 border-[#193243] bg-[#80b8a7]" />)}</div>
    <div className="absolute left-[205px] top-[325px] flex gap-3"><span className="h-7 w-16 border-2 border-[#193243] bg-[#a75a43] shadow-[3px_3px_0_#53604e]" /><span className="h-7 w-16 border-2 border-[#193243] bg-[#a75a43] shadow-[3px_3px_0_#53604e]" /><span className="h-7 w-16 border-2 border-[#193243] bg-[#a75a43] shadow-[3px_3px_0_#53604e]" /></div>
    <><div className="absolute left-[490px] top-[158px] h-44 w-52 rounded-[50%] border-4 border-[#e8dfaa]"><span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#e8dfaa]" /></div><div className="absolute left-[530px] top-[180px] h-10 w-2 rotate-12 bg-[#a75a43] shadow-[18px_10px_0_#e3b94e,36px_0_0_#a75a43]" /><div className="absolute left-[655px] top-[47px] h-14 w-12 border-2 border-[#193243] bg-[#bd6b4d] shadow-[inset_0_5px_0_#dfaf67]"><i className="absolute left-2 top-3 h-8 w-1 bg-[#193243]" /><i className="absolute right-2 top-3 h-8 w-1 bg-[#193243]" /></div><div className="absolute right-5 top-[350px] flex gap-2"><Trees className="h-8 w-8 text-[#315f56]" /><Trees className="h-6 w-6 text-[#376b58]" /><Trees className="h-8 w-8 text-[#315f56]" /></div></>
  </div>;
}

export function TisaSchoolMap() {
  const [floor, setFloor] = useState(1);
  const [selected, setSelected] = useState("Playground");
  const data = floors[floor];
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "1" || event.key === "2" || event.key === "3") setFloor(Number(event.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <main className="h-[100dvh] w-full overflow-auto bg-[#7e9c7b] font-['DM_Sans']">
      <style>{`.tisa-sprite{position:relative;display:inline-block;width:22px;height:30px;filter:drop-shadow(2px 2px 0 rgba(25,50,67,.45));}.tisa-sprite .sprite-head{position:absolute;left:6px;top:0;width:11px;height:11px;background:#e9b37a;border:2px solid #193243;border-radius:2px}.tisa-sprite .sprite-body{position:absolute;left:3px;top:10px;width:17px;height:18px;background:#a75a43;border:2px solid #193243;border-radius:3px 3px 1px 1px}.tisa-sprite.npc .sprite-body{background:#2f8b82}.tisa-sprite.npc .sprite-head{background:#c98d67}.tisa-map{background-color:#7e9c7b;background-image:linear-gradient(45deg,rgba(255,255,255,.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.08) 75%),linear-gradient(45deg,rgba(255,255,255,.08) 25%,transparent 25%,transparent 75%,rgba(255,255,255,.08) 75%);background-position:0 0,12px 12px;background-size:24px 24px}.tisa-path{background-color:#c9b77d;background-image:linear-gradient(90deg,rgba(72,69,56,.24) 1px,transparent 1px),linear-gradient(rgba(72,69,56,.2) 1px,transparent 1px);background-size:18px 18px;border:3px solid #334653;box-shadow:inset 0 0 0 5px #a39163}`}</style>
      <div className="relative mx-auto h-[820px] w-[760px] origin-top-left scale-[min(calc(100vw/760),calc(100vh/820))]">
        <div className="tisa-map relative h-[820px] w-[760px] overflow-hidden">
          <div className="tisa-path absolute left-[20px] top-[22px] h-[690px] w-[180px]" />
          <div className="tisa-path absolute left-[182px] top-[330px] h-[120px] w-[290px]" />
          <div className="tisa-path absolute left-[390px] top-[20px] h-[365px] w-[350px]" />
          <div className="tisa-path absolute left-[410px] top-[382px] h-[300px] w-[330px]" />
          {floor === 2 && <><div className="tisa-path absolute left-[20px] top-[20px] h-[760px] w-[180px]" /><div className="tisa-path absolute left-[180px] top-[370px] h-[95px] w-[300px]" /><div className="tisa-path absolute left-[450px] top-[370px] h-[280px] w-[270px]" /></>}
          {floor === 3 && <><div className="tisa-path absolute left-[50px] top-[20px] h-[410px] w-[190px]" /><div className="tisa-path absolute left-[50px] top-[402px] h-[390px] w-[190px]" /></>}
          {data.rooms.map((room, i) => <RoomTile key={`${room.name}-${i}`} room={room} active={selected === room.name} onSelect={() => setSelected(room.name)} />)}
          <WorldDetails floor={floor} />
          <div className="pointer-events-none absolute left-[250px] top-[710px] flex gap-8"><Sprite /><Sprite npc /><Sprite npc /></div>
          <div className="pointer-events-none absolute right-8 top-5 flex gap-3 text-[#315f56]"><Trees className="h-7 w-7" /><Trees className="h-6 w-6" /><Trees className="h-8 w-8" /></div>
          <div className="pointer-events-none absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-widest text-[#e8d39a]">TOMAT • dunia sekolah TISA</div>
        </div>
      </div>
    </main>
  );
}

export default TisaSchoolMap;