import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar'
import SidebarRight from './components/SidebarRight'
import Scene from './components/Scene'
import TopBar from './components/TopBar'

const MOTOKARAVAN_VEHICLES = {
  transit: { id: 'transit', type: 'motokaravan', name: 'Ford Transit (L4H3 - Jumbo)', innerSize: [1.68, 1.90, 4.12], chassis: { wheelbase: 3.75, trackWidth: 1.73, frameWidth: 1.05 } },
  crafter: { id: 'crafter', type: 'motokaravan', name: 'VW Crafter / MAN TGE (L4H3)', innerSize: [1.73, 1.98, 4.75], chassis: { wheelbase: 4.49, trackWidth: 1.78, frameWidth: 1.15 } },
  ducato: { id: 'ducato', type: 'motokaravan', name: 'Fiat Ducato / Peugeot Boxer (L4H3)', innerSize: [1.77, 1.97, 3.97], chassis: { wheelbase: 4.035, trackWidth: 1.80, frameWidth: 1.25 } },
  sprinter: { id: 'sprinter', type: 'motokaravan', name: 'MB Sprinter (L4H3)', innerSize: [1.69, 2.04, 4.61], chassis: { wheelbase: 4.325, trackWidth: 1.73, frameWidth: 0.90 } }
}

const ALKOVEN_VEHICLES = {
  iveco_daily: { id: 'iveco_daily', type: 'alkovenli', name: 'Iveco Daily Çift Kabin (7 Ton)', innerSize: [2.20, 2.10, 4.50], chassis: { wheelbase: 4.35, trackWidth: 1.74, frameWidth: 1.00 } },
  ford_transit_alk: { id: 'ford_transit_alk', type: 'alkovenli', name: 'Ford Transit Çift Kabin (470ED)', innerSize: [2.15, 2.10, 3.40], chassis: { wheelbase: 3.95, trackWidth: 1.74, frameWidth: 1.00 } },
  mb_sprinter_alk: { id: 'mb_sprinter_alk', type: 'alkovenli', name: 'MB Sprinter Çift Kabin (519 CDI)', innerSize: [2.20, 2.10, 3.60], chassis: { wheelbase: 4.32, trackWidth: 1.73, frameWidth: 0.90 } },
  isuzu_npr: { id: 'isuzu_npr', type: 'alkovenli', name: 'Isuzu NPR (Ağır Hizmet)', innerSize: [2.20, 2.10, 4.30], chassis: { wheelbase: 3.81, trackWidth: 1.80, frameWidth: 1.20 } }
}

function App() {
  const [items, setItems] = useState([])
  const [is3DView, setIs3DView] = useState(true)
  const [caravanType, setCaravanType] = useState('motokaravan')
  const [selectedVehicleId, setSelectedVehicleId] = useState('transit')
  const [customVehicleSizes, setCustomVehicleSizes] = useState({})

  const activeVehicles = caravanType === 'motokaravan' ? MOTOKARAVAN_VEHICLES : ALKOVEN_VEHICLES;
  const baseVehicle = activeVehicles[selectedVehicleId] || Object.values(activeVehicles)[0];
  const vehicle = {
    ...baseVehicle,
    innerSize: customVehicleSizes[baseVehicle.id] || baseVehicle.innerSize
  };

  const handleUpdateVehicleSize = (newSize) => {
    setCustomVehicleSizes(prev => ({
      ...prev,
      [vehicle.id]: newSize
    }))
  }

  const handleCaravanTypeChange = (type) => {
    setCaravanType(type);
    setSelectedVehicleId(Object.keys(type === 'motokaravan' ? MOTOKARAVAN_VEHICLES : ALKOVEN_VEHICLES)[0]);
  }
  const [selectedItemId, setSelectedItemId] = useState(null)

  const handleAddItem = (type) => {
    const newItem = {
      id: uuidv4(),
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }
    
    // MOBİLYA
    if (type === 'bed') {
      newItem.size = [1.3, 0.4, 1.9]; newItem.color = '#3b82f6'; newItem.name = 'Sabit Yatak'; newItem.weight = 30; newItem.price = 4500;
    } else if (type === 'high_bed') {
      newItem.size = [1.3, 0.4, 1.9]; newItem.color = '#3b82f6'; newItem.name = 'Yüksek Yatak (Garaj Üstü)'; newItem.weight = 35; newItem.price = 5500;
      newItem.elevation = 0.9; // Yüksekte başlasın
    } else if (type === 'seat_l') {
      newItem.size = [1.2, 0.45, 1.2]; newItem.color = '#64748b'; newItem.name = 'L Koltuk / Karşılıklı Oturma'; newItem.weight = 40; newItem.price = 8500;
    } else if (type === 'table_telescopic') {
      newItem.size = [0.8, 0.7, 0.6]; newItem.color = '#d4d4d8'; newItem.name = 'Teleskopik Masa'; newItem.weight = 15; newItem.price = 3500;
    } else if (type === 'swivel_seat') {
      newItem.size = [0.6, 1.0, 0.6]; newItem.color = '#1e293b'; newItem.name = 'Döner Koltuk (Kaptan)'; newItem.weight = 25; newItem.price = 6000;
    } else if (type === 'cabinet') {
      newItem.size = [0.8, 1.9, 0.5]; newItem.color = '#8b5cf6'; newItem.name = 'Yüksek Dolap'; newItem.weight = 40; newItem.price = 3500;
    } else if (type === 'kitchen') {
      newItem.size = [1.5, 0.9, 0.6]; newItem.color = '#10b981'; newItem.name = 'Mutfak Tezgahı'; newItem.weight = 50; newItem.price = 7000;
    } else if (type === 'wall') {
      newItem.size = [1.2, 1.9, 0.05]; newItem.color = '#e2e8f0'; newItem.name = 'Ara Bölme Duvarı'; newItem.weight = 15; newItem.price = 1000;
    } else if (type === 'overhead_cabinet') {
      newItem.size = [1.0, 0.35, 0.35]; newItem.color = '#8b5cf6'; newItem.name = 'Üst Dolap'; newItem.weight = 15; newItem.price = 2500;
      newItem.elevation = 1.4; // Tavana yakın başlasın
    } else if (type === 'wardrobe') {
      newItem.size = [0.6, 1.9, 0.5]; newItem.color = '#a78bfa'; newItem.name = 'Gardırop'; newItem.weight = 35; newItem.price = 4500;
    } else if (type === 'shoe_rack') {
      newItem.size = [0.4, 0.8, 0.3]; newItem.color = '#cbd5e1'; newItem.name = 'Ayakkabılık'; newItem.weight = 10; newItem.price = 1200;
    }
    // ENERJİ
    else if (type === 'battery') {
      newItem.size = [0.5, 0.25, 0.2]; newItem.color = '#1e293b'; newItem.name = 'LiFePO4 Akü 200Ah'; newItem.weight = 25; newItem.price = 15000;
    } else if (type === 'inverter') {
      newItem.size = [0.4, 0.15, 0.2]; newItem.color = '#64748b'; newItem.name = '3000W İnvertör'; newItem.weight = 8; newItem.price = 8000;
    } else if (type === 'solar_panel') {
      newItem.size = [1.6, 0.05, 1.0]; newItem.color = '#0284c7'; newItem.name = 'Güneş Paneli (205W)'; newItem.weight = 12; newItem.price = 3000;
      newItem.placement = 'roof';
    } else if (type === 'tv') {
      newItem.size = [0.7, 0.45, 0.05]; newItem.color = '#000000'; newItem.name = '12V Akıllı TV (24")'; newItem.weight = 4; newItem.price = 4500;
      newItem.elevation = 1.2;
    } else if (type === 'control_panel') {
      newItem.size = [0.3, 0.2, 0.02]; newItem.color = '#1e293b'; newItem.name = 'Kontrol Paneli'; newItem.weight = 1; newItem.price = 3000;
      newItem.elevation = 1.5;
    } else if (type === 'router') {
      newItem.size = [0.15, 0.05, 0.1]; newItem.color = '#f8fafc'; newItem.name = '4G/5G Router'; newItem.weight = 1; newItem.price = 2500;
    } else if (type === 'power_outlet') {
      newItem.size = [0.1, 0.1, 0.02]; newItem.color = '#cbd5e1'; newItem.name = '220V/USB Priz'; newItem.weight = 0.2; newItem.price = 400;
      newItem.elevation = 1.0;
    }
    // BEYAZ EŞYA
    else if (type === 'fridge') {
      newItem.size = [0.5, 1.4, 0.5]; newItem.color = '#e2e8f0'; newItem.name = '12V Buzdolabı 140L'; newItem.weight = 35; newItem.price = 18000;
    } else if (type === 'washing_machine') {
      newItem.size = [0.6, 0.85, 0.5]; newItem.color = '#ffffff'; newItem.name = 'Çamaşır Makinesi 3kg'; newItem.weight = 45; newItem.price = 12000;
    } else if (type === 'dishwasher') {
      newItem.size = [0.45, 0.45, 0.5]; newItem.color = '#f1f5f9'; newItem.name = 'Bulaşık Makinesi'; newItem.weight = 20; newItem.price = 9000;
    } else if (type === 'oven') {
      newItem.size = [0.5, 0.5, 0.5]; newItem.color = '#0f172a'; newItem.name = 'Gazlı Fırın'; newItem.weight = 18; newItem.price = 11000;
    } else if (type === 'kitchen_sink') {
      newItem.size = [0.4, 0.15, 0.4]; newItem.color = '#cbd5e1'; newItem.name = 'Evye ve Batarya'; newItem.weight = 3; newItem.price = 2500;
      newItem.elevation = 0.9;
    } else if (type === 'kitchen_stove') {
      newItem.size = [0.5, 0.05, 0.3]; newItem.color = '#1e293b'; newItem.name = 'İkili Gazlı Ocak'; newItem.weight = 5; newItem.price = 3500;
      newItem.elevation = 0.9;
    } else if (type === 'trash_bin') {
      newItem.size = [0.3, 0.4, 0.2]; newItem.color = '#64748b'; newItem.name = 'Çöp Kovası'; newItem.weight = 2; newItem.price = 400;
    } else if (type === 'reading_light') {
      newItem.size = [0.1, 0.1, 0.1]; newItem.color = '#facc15'; newItem.name = 'Okuma Lambası'; newItem.weight = 0.5; newItem.price = 350;
      newItem.elevation = 1.3;
    }
    // SU & ISITMA
    else if (type === 'water_tank') {
      newItem.size = [1.2, 0.4, 0.5]; newItem.color = '#38bdf8'; newItem.name = 'Temiz Su Deposu 200L'; newItem.weight = 205; newItem.price = 3500;
      newItem.placement = 'cabin'; // Default to cabin, user can change to under_floor
    } else if (type === 'waste_tank') {
      newItem.size = [1.0, 0.3, 0.5]; newItem.color = '#94a3b8'; newItem.name = 'Gri Su Deposu 150L'; newItem.weight = 15; newItem.price = 2200;
      newItem.placement = 'under_floor'; // Usually waste tanks default to under floor
    } else if (type === 'black_water_tank') {
      newItem.size = [0.8, 0.3, 0.4]; newItem.color = '#000000'; newItem.name = 'Siyah Su Deposu 100L'; newItem.weight = 10; newItem.price = 1900;
      newItem.placement = 'under_floor'; // Usually under floor

    } else if (type === 'heater') {
      newItem.size = [0.4, 0.15, 0.15]; newItem.color = '#ea580c'; newItem.name = '5kW Dizel Isıtıcı'; newItem.weight = 5; newItem.price = 4500;
    } else if (type === 'shower_tray') {
      newItem.size = [0.7, 0.1, 0.7]; newItem.color = '#f8fafc'; newItem.name = 'Duş Teknesi'; newItem.weight = 8; newItem.price = 2500;
    } else if (type === 'toilet') {
      newItem.size = [0.4, 0.5, 0.5]; newItem.color = '#f8fafc'; newItem.name = 'Kasetli Tuvalet'; newItem.weight = 10; newItem.price = 14000;
    } else if (type === 'bathroom_cabinet') {
      newItem.size = [0.4, 0.6, 0.15]; newItem.color = '#e2e8f0'; newItem.name = 'Banyo Dolabı'; newItem.weight = 8; newItem.price = 1800;
      newItem.elevation = 1.2;
    } else if (type === 'boiler') {
      newItem.size = [0.3, 0.4, 0.3]; newItem.color = '#facc15'; newItem.name = '10L Boiler'; newItem.weight = 15; newItem.price = 8500;
    } else if (type === 'water_heater') {
      newItem.size = [0.3, 0.5, 0.2]; newItem.color = '#cbd5e1'; newItem.name = 'Şofben (Gazlı/Elektrikli)'; newItem.weight = 12; newItem.price = 6000;
    } else if (type === 'ac') {
      newItem.size = [0.65, 0.25, 0.85]; newItem.color = '#ffffff'; newItem.name = 'Tavan Kliması 12V'; newItem.weight = 25; newItem.price = 25000;
      newItem.placement = 'roof';
    }
    // GÜVENLİK & DIŞ
    else if (type === 'fire_ext') {
      newItem.size = [0.15, 0.4, 0.15]; newItem.color = '#ef4444'; newItem.name = 'Yangın Tüpü'; newItem.weight = 2; newItem.price = 600;
    } else if (type === 'sensor') {
      newItem.size = [0.1, 0.05, 0.1]; newItem.color = '#94a3b8'; newItem.name = 'Gaz/Duman Sensörü'; newItem.weight = 0.3; newItem.price = 500;
      newItem.elevation = 1.8;
    } else if (type === 'awning') {
      newItem.size = [3.0, 0.1, 0.15]; newItem.color = '#475569'; newItem.name = 'Dış Tente'; newItem.weight = 25; newItem.price = 16000;
      newItem.placement = 'roof';
    } else if (type === 'moto_rack') {
      newItem.size = [1.8, 0.1, 0.7]; newItem.color = '#1e293b'; newItem.name = 'Motosiklet Taşıyıcı'; newItem.weight = 40; newItem.price = 15000;
      newItem.elevation = 0.4;
    } else if (type === 'tv_antenna') {
      newItem.size = [0.3, 0.2, 0.3]; newItem.color = '#cbd5e1'; newItem.name = 'TV Anteni'; newItem.weight = 2; newItem.price = 1200;
      newItem.placement = 'roof';
    } else if (type === 'roof_vent') {
      newItem.size = [0.4, 0.1, 0.4]; newItem.color = '#f8fafc'; newItem.name = 'Tavan Havalandırması (Heki)'; newItem.weight = 5; newItem.price = 2500;
      newItem.placement = 'roof';
    } else if (type === 'window') {
      newItem.size = [0.9, 0.45, 0.05]; newItem.color = '#000000'; newItem.name = 'Karavan Camı'; newItem.weight = 5; newItem.price = 1500;
      newItem.elevation = 0.5; // Camlar yerden biraz yüksekte başlasın
    } else if (type === 'outdoor_table') {
      newItem.size = [1.0, 0.1, 0.6]; newItem.color = '#94a3b8'; newItem.name = 'Dış Masa ve Sandalyeler'; newItem.weight = 12; newItem.price = 2500;
    } else if (type === 'outdoor_light') {
      newItem.size = [0.4, 0.05, 0.05]; newItem.color = '#fcd34d'; newItem.name = 'Dış Aydınlatma (LED)'; newItem.weight = 0.5; newItem.price = 800;
      newItem.elevation = 1.8;
    } else if (type === 'step') {
      newItem.size = [0.6, 0.1, 0.3]; newItem.color = '#1e293b'; newItem.name = 'Elektrikli Basamak'; newItem.weight = 6; newItem.price = 4500;
    } else if (type === 'water_hose') {
      newItem.size = [0.3, 0.15, 0.3]; newItem.color = '#38bdf8'; newItem.name = 'Temiz Su Dolum Hortumu'; newItem.weight = 2; newItem.price = 400;
    } else if (type === 'power_cable') {
      newItem.size = [0.3, 0.15, 0.3]; newItem.color = '#f87171'; newItem.name = 'Dış Elektrik Kablosu'; newItem.weight = 4; newItem.price = 800;
    }

    setItems([...items, newItem])
    setSelectedItemId(newItem.id)
  }

  const handleDuplicateItem = (id) => {
    const original = items.find(item => item.id === id);
    if (!original) return;

    const duplicate = {
      ...original,
      id: uuidv4(),
      position: [original.position[0] + 0.2, original.position[1], original.position[2] + 0.2]
    };
    
    setItems([...items, duplicate]);
    setSelectedItemId(duplicate.id);
  }

  const handleUpdateItemPosition = (id, newPosition) => {
    setItems(items.map(item => item.id === id ? { ...item, position: newPosition } : item))
  }

  const handleUpdateItemProperties = (id, newProps) => {
    setItems(items.map(item => item.id === id ? { ...item, ...newProps } : item))
  }
  
  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id))
    if (selectedItemId === id) setSelectedItemId(null)
  }

  const selectedItem = items.find(i => i.id === selectedItemId)

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] overflow-hidden font-sans text-gray-200">
      <TopBar 
        is3DView={is3DView}
        setIs3DView={setIs3DView}
        vehicles={activeVehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        caravanType={caravanType}
        onCaravanTypeChange={handleCaravanTypeChange}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          items={items} 
          onAddItem={handleAddItem} 
          onRemoveItem={handleRemoveItem}
        />
        
        <div className="flex-1 relative bg-[#1a1a1a]">
          <Scene 
            items={items} 
            is3DView={is3DView} 
            vehicle={vehicle}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            onUpdateItemPosition={handleUpdateItemPosition} 
          />
        </div>
        
        <SidebarRight 
          selectedItem={selectedItem}
          vehicle={vehicle}
          onUpdateItem={(props) => handleUpdateItemProperties(selectedItemId, props)}
          onUpdateVehicleSize={handleUpdateVehicleSize}
          onDeselect={() => setSelectedItemId(null)}
          onDuplicate={() => handleDuplicateItem(selectedItemId)}
          onRemove={() => handleRemoveItem(selectedItemId)}
        />
      </div>
    </div>
  )
}

export default App
