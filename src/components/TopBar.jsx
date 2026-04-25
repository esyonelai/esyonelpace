import { Eye, Grid, Truck, Save, Settings } from 'lucide-react'

export default function TopBar({ 
  is3DView, 
  setIs3DView, 
  vehicles, 
  selectedVehicleId, 
  onVehicleChange,
  caravanType,
  onCaravanTypeChange
}) {
  return (
    <div className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-6 text-gray-200 select-none shrink-0 z-20 relative shadow-md">
      {/* Sol: Logo / Marka */}
      <div className="flex items-center gap-3">
        <Truck className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-lg tracking-wide text-white">Esyonelpace<span className="text-blue-500 font-light">Pro</span></span>
      </div>

      {/* Orta: Araç Seçimi & Görünüm Modu */}
      <div className="flex items-center gap-6">
        
        {/* Karavan Tipi Seçici */}
        <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-md border border-[#444] hover:border-[#666] transition-colors">
          <Truck className="w-4 h-4 text-blue-400" />
          <select 
            value={caravanType}
            onChange={(e) => onCaravanTypeChange(e.target.value)}
            className="bg-transparent text-sm font-bold text-blue-400 outline-none cursor-pointer appearance-none pr-2"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="motokaravan" className="bg-[#1e1e1e]">Motokaravan</option>
            <option value="alkovenli" className="bg-[#1e1e1e]">Alkovenli</option>
          </select>
        </div>

        {/* Araç Seçici */}
        <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-md border border-[#444] hover:border-[#666] transition-colors">
          <Truck className="w-4 h-4 text-gray-400" />
          <select 
            value={selectedVehicleId}
            onChange={(e) => onVehicleChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-200 outline-none cursor-pointer appearance-none pr-4"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            {Object.values(vehicles).map(v => (
              <option key={v.id} value={v.id} className="bg-[#1e1e1e]">{v.name}</option>
            ))}
          </select>
        </div>

        {/* Görünüm Modu Geçişi */}
        <div className="flex bg-[#2a2a2a] p-1 rounded-md border border-[#444]">
          <button
            onClick={() => setIs3DView(true)}
            className={`px-4 py-1 text-xs font-bold rounded flex items-center gap-2 transition-all ${is3DView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Eye className="w-3.5 h-3.5" /> 3D
          </button>
          <button
            onClick={() => setIs3DView(false)}
            className={`px-4 py-1 text-xs font-bold rounded flex items-center gap-2 transition-all ${!is3DView ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Grid className="w-3.5 h-3.5" /> 2D
          </button>
        </div>
      </div>

      {/* Sağ: Ayarlar / Kaydet */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] rounded-md border border-[#444] hover:border-[#666]" title="Projeyi Kaydet">
          <Save className="w-4 h-4" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] rounded-md border border-[#444] hover:border-[#666]" title="Genel Ayarlar">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
