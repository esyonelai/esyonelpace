import { Settings, X, Trash2, Box, RotateCcw, Truck, Maximize, Minimize, ArrowDownToLine } from 'lucide-react'

export default function SidebarRight({ selectedItem, vehicle, onUpdateItem, onUpdateVehicleSize, onDeselect, onRemove, onDuplicate }) {
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
                {vehicle.type === 'alkovenli' ? (
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
                {vehicle.type === 'alkovenli' ? (
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
                {vehicle.type === 'alkovenli' ? (
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
            {vehicle.type === 'alkovenli' && (
              <p className="text-[10px] text-blue-400 mt-2 font-medium">Alkovenli araçlarda iç kullanım alanı ölçülerini değiştirebilirsiniz.</p>
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

        {/* Renk */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gövde Rengi</label>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={selectedItem.color} 
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0 shadow-sm"
            />
            <span className="text-sm font-mono text-gray-400 bg-[#2a2a2a] px-2 py-1 rounded border border-[#444]">{selectedItem.color}</span>
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
