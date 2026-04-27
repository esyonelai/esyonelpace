import { Eye, Grid, Truck, Save, Settings, Upload, FilePlus, BookmarkCheck, Moon, Sun, Camera, Scale, ChevronDown, Monitor, Info } from 'lucide-react'
import { useState } from 'react'

export default function TopBar({
  is3DView,
  setIs3DView,
  vehicles,
  selectedVehicleId,
  onVehicleChange,
  caravanType,
  onCaravanTypeChange,
  onSave,
  onLoad,
  onSetDefault,
  onNewProject,
  isNightMode,
  setIsNightMode,
  onScreenshot
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const selectedVehicle = Object.values(vehicles).find(v => v.id === selectedVehicleId) || Object.values(vehicles)[0];

  return (
    <div className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-6 text-gray-200 select-none shrink-0 z-20 relative shadow-md">
      {/* Sol: Logo / Marka */}
      <div className="flex items-center gap-3">
        <Truck className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-lg tracking-wide text-white">
          Esyonelpace<span className="text-blue-500 font-light">Pro</span>
          <span className="ml-2 text-[9px] uppercase tracking-normal text-gray-400 font-medium border-l border-[#444] pl-2">v.14 Ahmet Vural tescilli markasıdır.</span>
        </span>
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
            <option value="cekme" className="bg-[#1e1e1e]">Çekme Karavan</option>
          </select>
        </div>

        {/* Araç Seçici (Özel Dropdown) */}
        <div className="relative">
          <button 
            onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 min-w-[210px] justify-between shadow-lg group ${showVehicleDropdown ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#2a2a2a] border-[#444] text-gray-200 hover:border-blue-500/50 hover:bg-[#2d2d2d]'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1 rounded-md transition-colors ${showVehicleDropdown ? 'bg-white/20' : 'bg-[#333] text-blue-400 group-hover:text-blue-300'}`}>
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">
                {selectedVehicle?.name || 'Araç Seçin'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showVehicleDropdown ? 'rotate-180 text-white' : 'group-hover:text-gray-300'}`} />
          </button>

          {showVehicleDropdown && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowVehicleDropdown(false)}></div>
              <div className="absolute left-0 mt-3 w-[380px] bg-[#1e1e1ec0] backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                {caravanType === 'cekme' ? (
                  <div className="p-0">
                    <div className="grid grid-cols-[120px_1fr] bg-[#161616]/80 border-b border-white/5">
                      <div className="px-4 py-2.5 border-r border-white/5 flex items-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Kategori</span>
                      </div>
                      <div className="px-4 py-2.5 flex items-center">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Modeller</span>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {/* O1 SINIFI */}
                      <div className="grid grid-cols-[120px_1fr] hover:bg-white/[0.01] transition-colors group">
                        <div className="px-4 py-4 bg-[#1a1a1a]/40 flex flex-col justify-center border-r border-white/5">
                          <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                            <Scale className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold text-white">O1 Sınıfı</span>
                          </div>
                          <span className="text-[9px] text-gray-500 font-medium">750kg Altı</span>
                        </div>
                        <div className="p-1.5 grid grid-cols-1 gap-1">
                          {Object.values(vehicles).filter(v => v.trailerClass === 'O1').map(v => (
                            <button
                              key={v.id}
                              onClick={() => { onVehicleChange(v.id); setShowVehicleDropdown(false); }}
                              className={`group/item flex items-center justify-between px-3 py-2 rounded-md text-left transition-all duration-150 ${selectedVehicleId === v.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-600/10 text-gray-400 hover:text-white'}`}
                            >
                              <span className="text-xs font-semibold tracking-tight">{v.name.replace('O1 Sınıfı - ', '')}</span>
                              {selectedVehicleId === v.id && <div className="w-1 h-1 rounded-full bg-white"></div>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* O2 SINIFI */}
                      <div className="grid grid-cols-[120px_1fr] hover:bg-white/[0.01] transition-colors group">
                        <div className="px-4 py-4 bg-[#1a1a1a]/40 flex flex-col justify-center border-r border-white/5">
                          <div className="flex items-center gap-1.5 text-orange-400 mb-0.5">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="text-[12px] font-bold text-white">O2 Sınıfı</span>
                          </div>
                          <span className="text-[9px] text-gray-500 font-medium">+750kg Üstü</span>
                        </div>
                        <div className="p-1.5 grid grid-cols-1 gap-1">
                          {Object.values(vehicles).filter(v => v.trailerClass === 'O2').map(v => (
                            <button
                              key={v.id}
                              onClick={() => { onVehicleChange(v.id); setShowVehicleDropdown(false); }}
                              className={`group/item flex items-center justify-between px-3 py-2 rounded-md text-left transition-all duration-150 ${selectedVehicleId === v.id ? 'bg-orange-600 text-white shadow-md' : 'hover:bg-orange-600/10 text-gray-400 hover:text-white'}`}
                            >
                              <span className="text-xs font-semibold tracking-tight">{v.name.replace('O2 Sınıfı - ', '')}</span>
                              {selectedVehicleId === v.id && <div className="w-1 h-1 rounded-full bg-white"></div>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#121212]/80 px-4 py-2 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Info className="w-2.5 h-2.5 text-gray-600" />
                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">3D Sahne Aktif</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                    {Object.values(vehicles).map(v => (
                      <button
                        key={v.id}
                        onClick={() => { onVehicleChange(v.id); setShowVehicleDropdown(false); }}
                        className={`group flex items-center justify-between px-3 py-2 rounded-md text-left transition-all duration-150 ${selectedVehicleId === v.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Truck className={`w-3.5 h-3.5 ${selectedVehicleId === v.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`} />
                          <span className="text-xs font-bold">{v.name}</span>
                        </div>
                        {selectedVehicleId === v.id && <div className="w-1 h-1 rounded-full bg-white"></div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
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
        <input
          type="file"
          id="load-project"
          className="hidden"
          accept=".json"
          onChange={onLoad}
        />
        <button
          onClick={() => document.getElementById('load-project').click()}
          className="p-2 text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] rounded-md border border-[#444] hover:border-[#666]"
          title="Projeyi Yükle"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          onClick={onScreenshot}
          className="p-2 text-gray-400 hover:text-white transition-colors bg-[#2a2a2a] rounded-md border border-[#444] hover:border-[#666]"
          title="Ekran Görüntüsü Al"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className={`p-2 transition-colors rounded-md border border-[#444] hover:border-[#666] ${isNightMode ? 'bg-indigo-900/50 text-yellow-400 border-indigo-700' : 'text-gray-400 hover:text-white bg-[#2a2a2a]'}`}
          title={isNightMode ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
        >
          {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 transition-colors rounded-md border border-[#444] hover:border-[#666] ${showSettings ? 'bg-blue-600 text-white border-blue-500' : 'text-gray-400 hover:text-white bg-[#2a2a2a]'}`}
            title="Ayarlar ve Proje Yönetimi"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSettings(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl z-20 overflow-hidden py-1">
                <button
                  onClick={() => { onNewProject(); setShowSettings(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors text-left border-b border-[#333]"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Yeni Proje Başlat</span>
                </button>
                <button
                  onClick={() => { onSetDefault(); setShowSettings(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Bu Projeyi Varsayılan Yap</span>
                </button>
                <div className="px-4 py-2 text-[10px] text-gray-500 uppercase tracking-tighter bg-[#161616]">
                  Her açılışta bu proje otomatik gelir
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
