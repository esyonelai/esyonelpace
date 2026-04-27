import { useState } from 'react'
import { 
  Bed, Grid, PlusCircle, LayoutDashboard, Truck, 
  Zap, Droplets, Flame, ShieldAlert, ChevronDown, ChevronRight, 
  Refrigerator, Fan, Sun, BatteryMedium, Droplet, Toilet,
  Armchair, Lightbulb, Bath, Monitor, Wifi, Plug, Tent,
  Table2, Footprints, Bike
} from 'lucide-react'

const Category = ({ title, icon: Icon, colorClass, children, isOpen, onClick }) => (
  <div className="mb-2 border border-[#333] rounded-xl overflow-hidden bg-[#222] shadow-sm">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-[#262626] hover:bg-[#333] transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="font-bold text-sm text-gray-200">{title}</span>
      </div>
      {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
    </button>
    {isOpen && (
      <div className="p-2 grid grid-cols-1 gap-1.5 bg-[#1e1e1e]">
        {children}
      </div>
    )}
  </div>
);

const AddButton = ({ onClick, icon: Icon, title, colorClass, bgClass }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a2a] border border-transparent hover:border-[#444] transition-all text-left group"
  >
    <div className={`${bgClass} p-1.5 rounded-md group-hover:opacity-80 transition-opacity`}>
      <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
    </div>
    <div className="flex-1 font-semibold text-gray-300 text-xs">{title}</div>
    <PlusCircle className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
  </button>
);

export default function Sidebar({ items, onAddItem }) {
  const [openCategory, setOpenCategory] = useState('mobilya');

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  const toggleCat = (cat) => setOpenCategory(openCategory === cat ? null : cat);

  return (
    <div className="w-80 bg-[#1e1e1e] border-r border-[#333] flex flex-col h-full z-10 relative">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
        
        {/* Kategoriler */}
        <div>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Donanım Kataloğu
          </h2>
          
          <Category title="Mobilya & Yaşam" icon={Bed} colorClass="text-blue-400" isOpen={openCategory === 'mobilya'} onClick={() => toggleCat('mobilya')}>
            <AddButton onClick={() => onAddItem('seat_l')} icon={Armchair} title="L Koltuk Takımı" colorClass="text-slate-400" bgClass="bg-slate-800/40" />
            <AddButton onClick={() => onAddItem('double_seat')} icon={Armchair} title="İkili Koltuk" colorClass="text-slate-300" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('table_telescopic')} icon={Table2} title="Teleskopik Masa" colorClass="text-zinc-400" bgClass="bg-zinc-800/40" />
            <AddButton onClick={() => onAddItem('swivel_seat')} icon={Armchair} title="Döner Koltuk (Kaptan)" colorClass="text-stone-400" bgClass="bg-stone-800/40" />
            <AddButton onClick={() => onAddItem('bed')} icon={Bed} title="Sabit Yatak" colorClass="text-blue-400" bgClass="bg-blue-900/30" />
            <AddButton onClick={() => onAddItem('high_bed')} icon={Bed} title="Yüksek Yatak" colorClass="text-blue-300" bgClass="bg-blue-800/40" />
            <AddButton onClick={() => onAddItem('reading_light')} icon={Lightbulb} title="Okuma Lambası" colorClass="text-yellow-400" bgClass="bg-yellow-900/30" />
            <AddButton onClick={() => onAddItem('wardrobe')} icon={Grid} title="Gardırop" colorClass="text-purple-400" bgClass="bg-purple-900/30" />
            <AddButton onClick={() => onAddItem('shoe_rack')} icon={Grid} title="Ayakkabılık" colorClass="text-slate-300" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('cabinet')} icon={Grid} title="Yüksek Dolap" colorClass="text-purple-400" bgClass="bg-purple-900/30" />
            <AddButton onClick={() => onAddItem('kitchen')} icon={LayoutDashboard} title="Mutfak Tezgahı" colorClass="text-emerald-400" bgClass="bg-emerald-900/30" />
            <AddButton onClick={() => onAddItem('overhead_cabinet')} icon={Grid} title="Üst Dolap" colorClass="text-purple-300" bgClass="bg-purple-900/50" />
            <AddButton onClick={() => onAddItem('wall')} icon={LayoutDashboard} title="Ara Bölme Duvarı" colorClass="text-gray-200" bgClass="bg-gray-700/50" />
          </Category>

          <Category title="Enerji Sistemi" icon={Zap} colorClass="text-yellow-400" isOpen={openCategory === 'enerji'} onClick={() => toggleCat('enerji')}>
            <AddButton onClick={() => onAddItem('battery')} icon={BatteryMedium} title="LiFePO4 Akü (200Ah)" colorClass="text-gray-300" bgClass="bg-gray-700/50" />
            <AddButton onClick={() => onAddItem('inverter')} icon={Zap} title="3000W İnvertör" colorClass="text-indigo-400" bgClass="bg-indigo-900/30" />
            <AddButton onClick={() => onAddItem('solar_panel')} icon={Sun} title="Güneş Paneli (205W)" colorClass="text-orange-400" bgClass="bg-orange-900/30" />
            <AddButton onClick={() => onAddItem('control_panel')} icon={LayoutDashboard} title="Kontrol Paneli" colorClass="text-slate-300" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('power_outlet')} icon={Plug} title="220V/USB Priz" colorClass="text-slate-400" bgClass="bg-slate-700/30" />
            <AddButton onClick={() => onAddItem('power_cable')} icon={Plug} title="Dış Elektrik Kablosu" colorClass="text-red-400" bgClass="bg-red-900/30" />
          </Category>

          <Category title="Mutfak & Beyaz Eşya" icon={Refrigerator} colorClass="text-cyan-400" isOpen={openCategory === 'beyaz_esya'} onClick={() => toggleCat('beyaz_esya')}>
            <AddButton onClick={() => onAddItem('kitchen_sink')} icon={Droplet} title="Evye ve Batarya" colorClass="text-blue-300" bgClass="bg-blue-900/30" />
            <AddButton onClick={() => onAddItem('kitchen_stove')} icon={Flame} title="İkili Gazlı Ocak" colorClass="text-orange-400" bgClass="bg-orange-900/30" />
            <AddButton onClick={() => onAddItem('gas_tank')} icon={Flame} title="LPG / Gaz Tankı" colorClass="text-slate-300" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('fridge')} icon={Refrigerator} title="12V Buzdolabı 140L" colorClass="text-cyan-400" bgClass="bg-cyan-900/30" />
            <AddButton onClick={() => onAddItem('washing_machine')} icon={Fan} title="Çamaşır Makinesi 3kg" colorClass="text-teal-400" bgClass="bg-teal-900/30" />
            <AddButton onClick={() => onAddItem('dishwasher')} icon={Grid} title="Bulaşık Makinesi" colorClass="text-sky-400" bgClass="bg-sky-900/30" />
            <AddButton onClick={() => onAddItem('oven')} icon={Flame} title="Gazlı Fırın" colorClass="text-red-400" bgClass="bg-red-900/30" />
            <AddButton onClick={() => onAddItem('trash_bin')} icon={Grid} title="Çöp Kovası" colorClass="text-slate-400" bgClass="bg-slate-700/30" />
          </Category>

          <Category title="Banyo, Su & Isıtma" icon={Droplets} colorClass="text-blue-300" isOpen={openCategory === 'su'} onClick={() => toggleCat('su')}>
            <AddButton onClick={() => onAddItem('bathroom_cabin')} icon={Bath} title="Komple Banyo Kabini" colorClass="text-blue-400" bgClass="bg-blue-900/50" />
            <AddButton onClick={() => onAddItem('shower_tray')} icon={Bath} title="Duş Teknesi" colorClass="text-blue-200" bgClass="bg-blue-800/40" />
            <AddButton onClick={() => onAddItem('toilet')} icon={Toilet} title="Kasetli Tuvalet" colorClass="text-gray-300" bgClass="bg-gray-700/50" />
            <AddButton onClick={() => onAddItem('bathroom_cabinet')} icon={Grid} title="Banyo Dolabı" colorClass="text-slate-300" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('water_tank')} icon={Droplet} title="Temiz Su Deposu 200L" colorClass="text-blue-400" bgClass="bg-blue-900/30" />
            <AddButton onClick={() => onAddItem('waste_tank')} icon={Droplet} title="Gri Su Deposu 150L" colorClass="text-gray-400" bgClass="bg-gray-700/50" />
            <AddButton onClick={() => onAddItem('black_water_tank')} icon={Droplet} title="Siyah Su Deposu 100L" colorClass="text-gray-900" bgClass="bg-gray-500" />
            <AddButton onClick={() => onAddItem('water_hose')} icon={Droplet} title="Su Dolum Hortumu" colorClass="text-sky-400" bgClass="bg-sky-900/30" />
            <AddButton onClick={() => onAddItem('heater')} icon={Flame} title="5kW Dizel Isıtıcı" colorClass="text-orange-500" bgClass="bg-orange-900/30" />
            <AddButton onClick={() => onAddItem('boiler')} icon={Droplet} title="10L Su Isıtıcı (Boiler)" colorClass="text-yellow-500" bgClass="bg-yellow-900/30" />
            <AddButton onClick={() => onAddItem('water_heater')} icon={Flame} title="Şofben" colorClass="text-red-400" bgClass="bg-red-900/30" />
            <AddButton onClick={() => onAddItem('ac')} icon={Fan} title="Tavan Kliması 12V" colorClass="text-sky-300" bgClass="bg-sky-900/30" />
          </Category>

          <Category title="Güvenlik & Dış & Medya" icon={ShieldAlert} colorClass="text-red-400" isOpen={openCategory === 'guvenlik'} onClick={() => toggleCat('guvenlik')}>
            <AddButton onClick={() => onAddItem('window')} icon={LayoutDashboard} title="Karavan Camı" colorClass="text-sky-400" bgClass="bg-sky-900/30" />
            <AddButton onClick={() => onAddItem('sensor')} icon={ShieldAlert} title="Gaz/Duman Sensörü" colorClass="text-slate-400" bgClass="bg-slate-700/40" />
            <AddButton onClick={() => onAddItem('fire_ext')} icon={Flame} title="Yangın Tüpü" colorClass="text-red-500" bgClass="bg-red-900/30" />
            <AddButton onClick={() => onAddItem('awning')} icon={Tent} title="Dış Tente" colorClass="text-slate-300" bgClass="bg-slate-700/50" />
            <AddButton onClick={() => onAddItem('outdoor_carpet')} icon={Tent} title="Yeşil Dış Mekan Halısı" colorClass="text-green-400" bgClass="bg-green-900/30" />
            <AddButton onClick={() => onAddItem('outdoor_seating')} icon={Armchair} title="Bambu Masa Grubu" colorClass="text-yellow-400" bgClass="bg-yellow-900/30" />
            <AddButton onClick={() => onAddItem('bbq')} icon={Flame} title="Mangal / Dış Mutfak" colorClass="text-orange-500" bgClass="bg-orange-900/30" />
            <AddButton onClick={() => onAddItem('outdoor_stove')} icon={Flame} title="Dış Soba" colorClass="text-red-500" bgClass="bg-red-900/30" />
            <AddButton onClick={() => onAddItem('outdoor_tv')} icon={Monitor} title="Dış Mekan TV" colorClass="text-blue-300" bgClass="bg-blue-900/30" />
            <AddButton onClick={() => onAddItem('outdoor_table')} icon={Table2} title="Dış Masa/Sandalye" colorClass="text-zinc-400" bgClass="bg-zinc-800/40" />
            <AddButton onClick={() => onAddItem('outdoor_light')} icon={Lightbulb} title="Dış Aydınlatma" colorClass="text-yellow-400" bgClass="bg-yellow-900/30" />
            <AddButton onClick={() => onAddItem('step')} icon={Footprints} title="Elektrikli Basamak" colorClass="text-stone-400" bgClass="bg-stone-800/40" />
            <AddButton onClick={() => onAddItem('moto_rack')} icon={Truck} title="Motosiklet Taşıyıcı" colorClass="text-gray-400" bgClass="bg-gray-800/60" />
            <AddButton onClick={() => onAddItem('motorcycle')} icon={Bike} title="Yamaha NMAX 155" colorClass="text-blue-400" bgClass="bg-blue-900/40" />
            <AddButton onClick={() => onAddItem('tv')} icon={Monitor} title="12V Akıllı TV" colorClass="text-gray-300" bgClass="bg-gray-800/50" />
            <AddButton onClick={() => onAddItem('router')} icon={Wifi} title="4G/5G Router" colorClass="text-blue-300" bgClass="bg-blue-900/40" />
            <AddButton onClick={() => onAddItem('tv_antenna')} icon={Zap} title="TV Anteni" colorClass="text-blue-300" bgClass="bg-blue-900/30" />
            <AddButton onClick={() => onAddItem('roof_vent')} icon={Fan} title="Tavan Havalandırması" colorClass="text-teal-400" bgClass="bg-teal-900/30" />
          </Category>
        </div>

      </div>

      {/* Alt Sabit Kısım: İstatistikler */}
      <div className="p-4 border-t border-[#333] bg-[#1a1a1a] flex flex-col gap-4">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#222] p-2 rounded-lg border border-[#333] shadow-sm">
            <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Ağırlık Yükü</div>
            <div className="text-sm font-black text-gray-200">{totalWeight}<span className="text-[10px] font-bold text-gray-500 ml-1">kg</span></div>
          </div>
          <div className="bg-[#222] p-2 rounded-lg border border-[#333] shadow-sm">
            <div className="text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Donanım Maliyeti</div>
            <div className="text-sm font-black text-emerald-400">{totalPrice.toLocaleString('tr-TR')}<span className="text-[10px] font-bold text-emerald-600 ml-0.5">₺</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
