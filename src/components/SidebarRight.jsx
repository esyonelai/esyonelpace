import { Settings, X, Trash2, Box, RotateCcw, Truck, Maximize, Minimize, ArrowDownToLine, Sparkles, Tent } from 'lucide-react'

export default function SidebarRight({ 
  selectedItem, 
  vehicle, 
  onUpdateItem, 
  onUpdateVehicleSize,
  caravanType,
  trailerClass,
  setTrailerClass,
  trailerShape,
  setTrailerShape,
  wallTexture, 
  onUpdateWallTexture, 
  floorTexture, 
  onUpdateFloorTexture,
  onDeselect,
  onDuplicate,
  onRemove,
  onLinkOutdoorItems
}) {
  if (!selectedItem) {
    const [w, h, l] = vehicle.innerSize;
    // VanModel.jsx'e göre dış hesaplamalar:
    const outerW = w + (0.05 * 2);
    const outerH = h + 0.2 + 0.1; 
    const outerL = l + 1.5 + 0.05; 
    
    return (
      <div className="w-80 bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full z-10 relative">
        <div className="p-5 border-b border-[#333] flex items-center bg-[#222]">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-200">
            <Truck className="w-5 h-5 text-gray-400" />
            Araç Bilgileri
          </h2>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444]">
            <h3 className="text-sm font-bold text-gray-200 mb-1">{vehicle.name}</h3>
            <p className="text-[11px] text-gray-400 font-medium">Şu an üzerinde çalıştığınız aracın genel boyutları aşağıdadır.</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Minimize className="w-3.5 h-3.5"/> İç Kullanım Alanı</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Genişlik</div>
                {(vehicle.type === 'alkovenli' || caravanType === 'cekme') ? (
                  <div className="flex items-center justify-center">
                    <input 
                      type="number" 
                      value={Math.round(w * 100)} 
                      onChange={(e) => onUpdateVehicleSize([parseFloat(e.target.value) / 100 || 0.1, h, l])}
                      className="w-12 bg-[#1a1a1a] text-gray-200 text-sm font-black text-center border border-[#444] rounded outline-none focus:border-blue-500 py-0.5"
                    />
                    <span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span>
                  </div>
                ) : (
                  <div className="text-sm font-black text-gray-200">{Math.round(w * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
                )}
              </div>
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Yükseklik</div>
                {(vehicle.type === 'alkovenli' || caravanType === 'cekme') ? (
                  <div className="flex items-center justify-center">
                    <input 
                      type="number" 
                      value={Math.round(h * 100)} 
                      onChange={(e) => onUpdateVehicleSize([w, parseFloat(e.target.value) / 100 || 0.1, l])}
                      className="w-12 bg-[#1a1a1a] text-gray-200 text-sm font-black text-center border border-[#444] rounded outline-none focus:border-blue-500 py-0.5"
                    />
                    <span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span>
                  </div>
                ) : (
                  <div className="text-sm font-black text-gray-200">{Math.round(h * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
                )}
              </div>
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Uzunluk</div>
                {(vehicle.type === 'alkovenli' || caravanType === 'cekme') ? (
                  <div className="flex items-center justify-center">
                    <input 
                      type="number" 
                      value={Math.round(l * 100)} 
                      onChange={(e) => onUpdateVehicleSize([w, h, parseFloat(e.target.value) / 100 || 0.1])}
                      className="w-12 bg-[#1a1a1a] text-gray-200 text-sm font-black text-center border border-[#444] rounded outline-none focus:border-blue-500 py-0.5"
                    />
                    <span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span>
                  </div>
                ) : (
                  <div className="text-sm font-black text-gray-200">{Math.round(l * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
                )}
              </div>
            </div>
            {caravanType === 'cekme' && (
              <div className="mt-4 p-3 bg-blue-900/10 border border-blue-800/30 rounded-xl text-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                   {trailerClass} Sınıfı - {trailerShape === 'Standard' ? 'Erba' : trailerShape === 'Aerodynamic' ? 'Adria' : 'Kapsül'} Modeli Seçili
                </span>
              </div>
            )}
            {(vehicle.type === 'alkovenli' || caravanType === 'cekme') && (
              <p className="text-[10px] text-blue-400 mt-2 font-medium">İç kullanım alanı ölçülerini kutucuklara tıklayarak değiştirebilirsiniz.</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5"/> Dış Ölçüler (Kabin Dahil)</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Dış Gen.</div>
                <div className="text-sm font-black text-gray-200">{Math.round(outerW * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
              </div>
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Top. Yük.</div>
                <div className="text-sm font-black text-gray-200">{Math.round(outerH * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
              </div>
              <div className="bg-[#222] border border-[#333] p-2 rounded-lg text-center shadow-sm">
                <div className="text-[10px] font-bold text-gray-500 mb-1">Top. Boy</div>
                <div className="text-sm font-black text-gray-200">{Math.round(outerL * 100)}<span className="text-[10px] font-bold text-gray-500 ml-0.5">cm</span></div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#333] pt-6 flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">İç Duvar Kaplaması</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'white', name: 'Beyaz' },
                  { id: 'wood_oak', name: 'Meşe' },
                  { id: 'wood_walnut', name: 'Ceviz' },
                  { id: 'fabric_grey', name: 'Antrasit' },
                ].map(tex => (
                  <button
                    key={tex.id}
                    onClick={() => onUpdateWallTexture(tex.id)}
                    className={`text-[10px] py-2 rounded border transition-all ${wallTexture === tex.id ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-[#2a2a2a] border-[#444] text-gray-400 hover:border-[#666]'}`}
                  >
                    {tex.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Zemin Kaplaması</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'wood_oak', name: 'Açık Parke' },
                  { id: 'wood_walnut', name: 'Koyu Parke' },
                  { id: 'metal_anthracite', name: 'Gri Vinil' },
                  { id: 'marble_white', name: 'Mermer Görünüm' },
                ].map(tex => (
                  <button
                    key={tex.id}
                    onClick={() => onUpdateFloorTexture(tex.id)}
                    className={`text-[10px] py-2 rounded border transition-all ${floorTexture === tex.id ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-[#2a2a2a] border-[#444] text-gray-400 hover:border-[#666]'}`}
                  >
                    {tex.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center border-t border-[#333]">
            <p className="text-xs text-gray-500 font-medium">Mobilya özelliklerini düzenlemek için 3 boyutlu alandaki bir eşyaya tıklayın.</p>
          </div>

        </div>
      </div>
    );
  }

  const [w, h, d] = selectedItem.size;

  const handleChange = (field, value) => {
    onUpdateItem({ [field]: value });
  };

  const handleSizeChange = (index, value) => {
    const newSize = [...selectedItem.size];
    newSize[index] = parseFloat(value) / 100 || 0.1; 
    onUpdateItem({ size: newSize });
  };

  return (
    <div className="w-80 bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full z-10 relative">
      <div className="p-5 border-b border-[#333] flex items-center justify-between bg-[#222]">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-200">
          <Settings className="w-5 h-5 text-blue-500" />
          Özellikler
        </h2>
        <button onClick={onDeselect} className="text-gray-400 hover:text-gray-200 bg-[#2a2a2a] border border-[#444] p-1.5 rounded-md hover:bg-[#333] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {/* Temel Bilgiler */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">İsim</label>
          <input 
            type="text" 
            value={selectedItem.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
          />
        </div>

        {/* Tente Özel Ayarları */}
        {selectedItem.type === 'awning' && (
          <div className="flex flex-col gap-4">
            <div className="bg-green-900/20 border border-green-800/30 p-3 rounded-xl">
              <label className="block text-[11px] font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tent className="w-3.5 h-3.5" /> Dış Mekan / Oda Ayarları
              </label>
              <button
                onClick={onLinkOutdoorItems}
                className="w-full mb-3 py-2.5 rounded-lg font-bold text-xs bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Dış Yerleşimi Tenteye Bağla
              </button>
              <p className="text-[10px] text-green-300/70 leading-relaxed mb-3">
                Önce dış mekan eşyalarınızı (halı, masa, vb.) yerleştirin. Ardından bu butona basarak hepsini tenteye bağlayın. Tente kapandığında eşyalar gizlenir.
              </p>
              
              <button
                onClick={() => handleChange('hasSideWalls', !selectedItem.hasSideWalls)}
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  selectedItem.hasSideWalls 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-[#2a2a2a] text-gray-400 border border-[#444] hover:border-blue-500/50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {selectedItem.hasSideWalls ? 'Kış Bahçesini Kaldır' : 'Kış Bahçesi (Çadır) Kur'}
              </button>

              {selectedItem.hasSideWalls && (
                <>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleChange('isGardenDoorOpen', !selectedItem.isGardenDoorOpen)}
                      className="py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold hover:bg-indigo-600/30 transition-all"
                    >
                      🚪 Kapıyı {selectedItem.isGardenDoorOpen ? 'Kapat' : 'Aç'}
                    </button>
                    <div className="relative group">
                      <input 
                        type="color" 
                        value={selectedItem.gardenColor || '#cbd5e1'} 
                        onChange={(e) => handleChange('gardenColor', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="py-2 rounded-lg bg-gray-800 border border-gray-700 text-[10px] font-bold text-center flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: selectedItem.gardenColor || '#cbd5e1' }}></div>
                        Kumaş Rengi
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-2 bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Tente Açılım Mesafesi (cm)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="150" 
                    max="500" 
                    step="10"
                    value={Math.round((selectedItem.extension || 2.5) * 100)} 
                    onChange={(e) => handleChange('extension', parseFloat(e.target.value) / 100)}
                    className="flex-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-blue-400 w-12 text-right">{Math.round((selectedItem.extension || 2.5) * 100)}<span className="text-[9px] ml-0.5 text-gray-500">cm</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tente ve Kapak Kontrolü */}
        {(selectedItem.type === 'awning' || 
          selectedItem.type === 'wardrobe' || 
          selectedItem.type === 'cabinet' || 
          selectedItem.type === 'bathroom_cabinet' || 
          selectedItem.type === 'overhead_cabinet' || 
          selectedItem.type === 'shoe_rack' || 
          selectedItem.type === 'fridge' || 
          selectedItem.type === 'oven' || 
          selectedItem.type === 'dishwasher' || 
          selectedItem.type === 'washing_machine' || 
          selectedItem.type === 'kitchen' ||
          selectedItem.type === 'step' ||
          selectedItem.type === 'solar_panel' ||
          selectedItem.type === 'window' ||
          selectedItem.type === 'moto_rack'
        ) && (
          <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-xl">
            <label className="block text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Fonksiyonel Özellikler
            </label>
            <button
              onClick={() => handleChange('isOpen', !selectedItem.isOpen)}
              className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                selectedItem.isOpen 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-[#2a2a2a] text-gray-400 border border-[#444] hover:border-blue-500/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${selectedItem.isOpen ? 'bg-white animate-pulse' : 'bg-gray-600'}`}></div>
              {selectedItem.type === 'awning' ? 'Tenteyi' : (
                selectedItem.type === 'kitchen' ? 'Çekmeceleri' : (
                  selectedItem.type === 'step' ? 'Basamağı' : (
                    selectedItem.type === 'solar_panel' ? 'Panelleri' : (
                      selectedItem.type === 'moto_rack' ? 'Taşıyıcıyı' : (selectedItem.type === 'window' ? 'Pencereyi' : 'Kapağı')
                    )
                  )
                )
              )} {selectedItem.isOpen ? 'Kapat' : 'Aç'}
            </button>
          </div>
        )}

        {/* Motosiklet Taşıyıcı Özel Ayarları */}
        {selectedItem.type === 'moto_rack' && (
          <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
             <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Motosiklet Durumu</label>
             <button
               onClick={() => handleChange('hasMotorcycle', !selectedItem.hasMotorcycle)}
               className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                 selectedItem.hasMotorcycle 
                   ? 'bg-blue-600 text-white shadow-md' 
                   : 'bg-[#1a1a1a] text-gray-500 border border-[#444] hover:border-[#666]'
               }`}
             >
               {selectedItem.hasMotorcycle ? 'Motosikleti Gizle' : 'Otomatik Motosiklet Ekle'}
             </button>
             <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
               Taşıyıcı açıkken üzerinde otomatik olarak bir motosiklet gösterilir. Kapandığında taşıyıcı karavana doğru katlanır.
             </p>
          </div>
        )}

        {/* Çekmece Sayısı (Mutfak İçin) */}
        {selectedItem.type === 'kitchen' && (
          <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Çekmece Sırası</label>
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => handleChange('drawerCount', count)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    (selectedItem.drawerCount || 3) === count 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {count} Sıra
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gaz Tankı Özellikleri */}
        {selectedItem.type === 'gas_tank' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tank Tipi</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'household_tank', name: 'Ev Tüpü' },
                  { id: 'vertical_cylinder', name: 'Dik Tüp' },
                  { id: 'spherical', name: 'Yuvarlak' },
                  { id: 'torus', name: 'Tekerlek' },
                ].map(tank => (
                  <button
                    key={tank.id}
                    onClick={() => handleChange('tankType', tank.id)}
                    className={`py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      (selectedItem.tankType || 'household_tank') === tank.id 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'bg-[#1a1a1a] text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    {tank.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kapasite (Litre)</label>
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg overflow-x-auto scrollbar-hide">
                {[12, 18, 22, 45, 60, 90].map(cap => (
                  <button
                    key={cap}
                    onClick={() => handleChange('capacity', cap)}
                    className={`flex-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${
                      (selectedItem.capacity || 12) === cap 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {cap}L
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Güneş Paneli Özellikleri */}
        {selectedItem.type === 'solar_panel' && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Panel Sayısı</label>
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
                {[1, 2, 3].map(count => (
                  <button
                    key={count}
                    onClick={() => handleChange('panelCount', count)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      (selectedItem.panelCount || 1) === count 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {count}'lü Set
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Açılış Yönü</label>
              <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
                {[
                  { id: 'left', name: 'Sola' },
                  { id: 'right', name: 'Sağa' },
                  { id: 'both', name: 'Her İki' },
                ].map(side => (
                  <button
                    key={side.id}
                    onClick={() => handleChange('openingSide', side.id)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      (selectedItem.openingSide || 'both') === side.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {side.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {selectedItem.type === 'step' && (
          <div className="bg-[#2a2a2a] p-3 rounded-xl border border-[#444]">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Basamak Sayısı</label>
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg">
              {[1, 2, 3].map(count => (
                <button
                  key={count}
                  onClick={() => handleChange('stepCount', count)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    (selectedItem.stepCount || 1) === count 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {count} Basamak
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Yön / Döndürme */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Yön</label>
          <button 
             onClick={() => {
                const currentRot = selectedItem.rotation || [0,0,0];
                const newRot = [...currentRot];
                newRot[1] += Math.PI / 2; // 90 derece döndür
                onUpdateItem({ rotation: newRot });
             }}
             className="w-full flex items-center justify-center gap-2 bg-[#2a2a2a] border border-[#444] hover:border-[#666] text-gray-300 hover:text-white py-2.5 rounded-lg transition-all font-bold text-sm shadow-sm"
          >
             <RotateCcw className="w-4 h-4" /> 90° Döndür
          </button>
        </div>

        {/* Boyutlar */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Box className="w-4 h-4"/> Ölçüler (cm)</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-1">Genişlik (X)</label>
              <input 
                type="number" 
                value={Math.round(w * 100)} 
                onChange={(e) => handleSizeChange(0, e.target.value)}
                className="w-full px-2 py-1.5 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-md text-sm text-center font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-1">Yükseklik (Y)</label>
              <input 
                type="number" 
                value={Math.round(h * 100)} 
                onChange={(e) => handleSizeChange(1, e.target.value)}
                className="w-full px-2 py-1.5 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-md text-sm text-center font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold mb-1">Derinlik (Z)</label>
              <input 
                type="number" 
                value={Math.round(d * 100)} 
                onChange={(e) => handleSizeChange(2, e.target.value)}
                className="w-full px-2 py-1.5 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-md text-sm text-center font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Yerden Yükseklik (Y Ekseni) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Yukarı / Aşağı Kaydır (cm)</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="-100" 
              max="200" 
              value={Math.round((selectedItem.elevation || 0) * 100)} 
              onChange={(e) => handleChange('elevation', parseFloat(e.target.value) / 100)}
              className="flex-1 accent-blue-500 cursor-pointer"
            />
            <input 
              type="number" 
              value={Math.round((selectedItem.elevation || 0) * 100)} 
              onChange={(e) => handleChange('elevation', parseFloat(e.target.value) / 100)}
              className="w-16 px-2 py-1 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-md text-sm text-center font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Renk ve Doku */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Gövde Rengi ve Doku</label>
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="color" 
              value={selectedItem.color} 
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shadow-sm"
            />
            <span className="text-sm font-mono text-gray-400 bg-[#2a2a2a] px-2 py-1 rounded border border-[#444]">{selectedItem.color}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'white', name: 'Standart Beyaz' },
              { id: 'wood_oak', name: 'Doğal Meşe' },
              { id: 'wood_walnut', name: 'Ceviz (Koyu)' },
              { id: 'fabric_grey', name: 'Gri Kumaş' },
              { id: 'fabric_beige', name: 'Bej Kumaş' },
              { id: 'metal_anthracite', name: 'Antrasit Metal' },
              { id: 'marble_white', name: 'Mermer Desen' },
            ].map(tex => (
              <button
                key={tex.id}
                onClick={() => handleChange('texture', tex.id)}
                className={`text-[10px] py-2 px-1 rounded border transition-all ${selectedItem.texture === tex.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-[#2a2a2a] border-[#444] text-gray-400 hover:border-[#666]'}`}
              >
                {tex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Konumlandırma (Sadece Su Depoları İçin) */}
        {(selectedItem.type === 'water_tank' || selectedItem.type === 'waste_tank' || selectedItem.type === 'black_water_tank') && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
              <ArrowDownToLine className="w-4 h-4" /> Montaj Yeri
            </label>
            <div className="flex bg-[#2a2a2a] p-1 rounded-lg">
              <button
                onClick={() => handleChange('placement', 'cabin')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedItem.placement !== 'under_floor' ? 'bg-[#333] shadow text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Kabin İçi
              </button>
              <button
                onClick={() => handleChange('placement', 'under_floor')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedItem.placement === 'under_floor' ? 'bg-[#333] shadow text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Taban Altı
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5">Taban altı seçildiğinde şase aralığındaki güvenli bölgeye yerleşir.</p>
          </div>
        )}

        {/* Diğer Özellikler */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ağırlık (kg)</label>
          <input 
            type="number" 
            value={selectedItem.weight} 
            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-[#2a2a2a] text-gray-200 border border-[#444] rounded-lg text-sm font-medium focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Silme */}
        <div className="mt-4 pt-6 border-t border-[#333] flex flex-col gap-2">
           <button 
             onClick={onDuplicate}
             className="w-full flex items-center justify-center gap-2 bg-[#2a2a2a] text-blue-400 hover:bg-[#333] py-2.5 rounded-lg transition-colors font-bold text-sm border border-[#444]"
           >
             <Box className="w-4 h-4" /> Eşyayı Çoğalt (Kopyala)
           </button>
           <button 
             onClick={onRemove}
             className="w-full flex items-center justify-center gap-2 bg-[#3a1a1a] text-red-400 hover:bg-red-900/50 py-2.5 rounded-lg transition-colors font-bold text-sm border border-[#5a2a2a]"
           >
             <Trash2 className="w-4 h-4" /> Seçili Eşyayı Sil
           </button>
        </div>
      </div>
    </div>
  )
}
