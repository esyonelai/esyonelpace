import { useState, useEffect, useMemo } from 'react'
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

const TRAILER_VEHICLES = {
  o1_erba: { id: 'o1_erba', type: 'cekme', trailerClass: 'O1', trailerShape: 'Standard', name: 'O1 Sınıfı - Model 1', innerSize: [2.00, 1.95, 3.90] },
  o1_adria: { id: 'o1_adria', type: 'cekme', trailerClass: 'O1', trailerShape: 'Aerodynamic', name: 'O1 Sınıfı - Model 2', innerSize: [2.00, 1.95, 3.90] },
  o1_capsule: { id: 'o1_capsule', type: 'cekme', trailerClass: 'O1', trailerShape: 'Oval', name: 'O1 Sınıfı - Model 3', innerSize: [2.00, 1.95, 3.00] },
  o2_erba: { id: 'o2_erba', type: 'cekme', trailerClass: 'O2', trailerShape: 'Standard', name: 'O2 Sınıfı - Model 1', innerSize: [2.30, 2.00, 5.50] },
  o2_adria: { id: 'o2_adria', type: 'cekme', trailerClass: 'O2', trailerShape: 'Aerodynamic', name: 'O2 Sınıfı - Model 2', innerSize: [2.30, 2.05, 5.50] },
  o2_capsule: { id: 'o2_capsule', type: 'cekme', trailerClass: 'O2', trailerShape: 'Oval', name: 'O2 Sınıfı - Model 3', innerSize: [2.30, 2.00, 5.00] },
}

function App() {
  const [items, setItems] = useState([])
  const [is3DView, setIs3DView] = useState(true)
  const [caravanType, setCaravanType] = useState('motokaravan') // 'motokaravan', 'alkovenli', 'cekme'
  const [trailerClass, setTrailerClass] = useState('O1') // 'O1', 'O2'
  const [trailerShape, setTrailerShape] = useState('Standard') // 'Standard', 'Aerodynamic', 'Oval'
  const [selectedVehicleId, setSelectedVehicleId] = useState('transit')
  const [customVehicleSizes, setCustomVehicleSizes] = useState({})
  const [wallTexture, setWallTexture] = useState('white')
  const [floorTexture, setFloorTexture] = useState('wood_oak')
  const [isNightMode, setIsNightMode] = useState(false)


  const activeVehicles = caravanType === 'motokaravan' ? MOTOKARAVAN_VEHICLES : (caravanType === 'cekme' ? TRAILER_VEHICLES : ALKOVEN_VEHICLES);
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

  // --- KAYDET / YÜKLE MANTIĞI ---

  // Otomatik Yükleme (Mount anında)
  useEffect(() => {
    // Önce kalıcı varsayılan projeyi dene, yoksa son çalışma projesini dene
    const defaultSaved = localStorage.getItem('caravan_default_project');
    const lastSaved = localStorage.getItem('caravan_project');
    const saved = defaultSaved || lastSaved;

    if (saved) {
      try {
        const projectData = JSON.parse(saved);
        if (projectData.items) setItems(projectData.items);
        if (projectData.caravanType) setCaravanType(projectData.caravanType);
        if (projectData.selectedVehicleId) setSelectedVehicleId(projectData.selectedVehicleId);
        if (projectData.customVehicleSizes) setCustomVehicleSizes(projectData.customVehicleSizes);
        if (projectData.wallTexture) setWallTexture(projectData.wallTexture);
        if (projectData.floorTexture) setFloorTexture(projectData.floorTexture);
      } catch (err) {
        console.error("Otomatik yükleme hatası:", err);
      }
    }
  }, []);

  // Otomatik Kayıt (Değişiklik olduğunda)
  useEffect(() => {
    if (items.length === 0 && selectedVehicleId === 'transit' && caravanType === 'motokaravan') return; // Boş projeyi kaydetme (opsiyonel)
    const projectData = {
      items,
      caravanType,
      selectedVehicleId,
      customVehicleSizes,
      wallTexture,
      floorTexture
    };
    localStorage.setItem('caravan_project', JSON.stringify(projectData));
  }, [items, caravanType, selectedVehicleId, customVehicleSizes]);

  // Projeyi Dosya Olarak İndir
  const handleSaveProject = () => {
    const projectData = {
      items,
      caravanType,
      selectedVehicleId,
      customVehicleSizes,
      wallTexture,
      floorTexture,
      savedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EsyonelPacePro_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Kalıcı Varsayılan Olarak Ayarla
  const handleSetDefaultProject = () => {
    const projectData = {
      items,
      caravanType,
      selectedVehicleId,
      customVehicleSizes,
      wallTexture,
      floorTexture
    };
    localStorage.setItem('caravan_default_project', JSON.stringify(projectData));
    alert('Bu proje varsayılan olarak kaydedildi! Artık her açılışta bu proje yüklenecektir.');
  };

  // Yeni Proje (Sıfırla)
  const handleNewProject = () => {
    if (window.confirm('Yeni bir projeye başlamak üzeresiniz. Mevcut tasarımınız silinecek. Emin misiniz?')) {
      setItems([]);
      setCaravanType('motokaravan');
      setSelectedVehicleId('transit');
      setCustomVehicleSizes({});
      setWallTexture('white');
      setFloorTexture('wood_oak');
      localStorage.removeItem('caravan_project'); // Son çalışma kaydını sil
      // Varsayılan kaydı silmiyoruz, kullanıcı isterse "Varsayılan Yap" diyerek üzerine yazar
    }
  };

  // Dosyadan Proje Yükle
  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target.result);
        if (projectData.items) setItems(projectData.items);
        if (projectData.caravanType) setCaravanType(projectData.caravanType);
        if (projectData.selectedVehicleId) setSelectedVehicleId(projectData.selectedVehicleId);
        if (projectData.customVehicleSizes) setCustomVehicleSizes(projectData.customVehicleSizes);
        if (projectData.wallTexture) setWallTexture(projectData.wallTexture);
        if (projectData.floorTexture) setFloorTexture(projectData.floorTexture);
        alert("Proje başarıyla yüklendi!");
      } catch (err) {
        console.error("Yükleme hatası:", err);
        alert("Dosya okunamadı veya geçersiz format!");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  // ------------------------------

  // Ekran Görüntüsü Al
  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    // Geçici olarak kenar çizgilerini vs gizlemek isteyebiliriz ama şimdilik direkt çekiyoruz
    const link = document.createElement('a');
    link.setAttribute('download', `EsyonelPacePro-${new Date().getTime()}.png`);
    link.setAttribute('href', canvas.toDataURL("image/png"));
    link.click();
  };

  const handleCaravanTypeChange = (type) => {
    setCaravanType(type)
    const list = type === 'motokaravan' ? MOTOKARAVAN_VEHICLES : (type === 'cekme' ? TRAILER_VEHICLES : ALKOVEN_VEHICLES);
    const firstId = Object.keys(list)[0];
    setSelectedVehicleId(firstId);
    
    if (type === 'cekme') {
      setTrailerClass(list[firstId].trailerClass);
      setTrailerShape(list[firstId].trailerShape);
    }
  }

  const handleVehicleChange = (id) => {
    setSelectedVehicleId(id);
    if (caravanType === 'cekme' && TRAILER_VEHICLES[id]) {
      setTrailerClass(TRAILER_VEHICLES[id].trailerClass);
      setTrailerShape(TRAILER_VEHICLES[id].trailerShape);
    }
  }
  const [selectedItemId, setSelectedItemId] = useState(null)

  const handleAddItem = (type) => {
    const newItem = {
      id: uuidv4(),
      type,
      position: [2.5, 0, 0], // Yeni eklenen eşyalar karavanın sağ dışında belirsin
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
    } else if (type === 'double_seat') {
      newItem.size = [0.9, 0.8, 0.5]; newItem.color = '#475569'; newItem.name = 'İkili Yolcu Koltuğu'; newItem.weight = 20; newItem.price = 4500;
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
      newItem.size = [2.465, 0.03, 1.134]; newItem.color = '#0284c7'; newItem.name = 'Güneş Paneli (Astro 610W)'; newItem.weight = 34.7; newItem.price = 6500;
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
    } else if (type === 'gas_tank') {
      newItem.size = [0.3, 0.5, 0.3]; newItem.color = '#94a3b8'; newItem.name = 'LPG / Gaz Tankı'; newItem.weight = 15; newItem.price = 4500;
      newItem.tankType = 'household_tank'; newItem.capacity = 12;
    } else if (type === 'reading_light') {
      newItem.size = [0.1, 0.1, 0.1]; newItem.color = '#facc15'; newItem.name = 'Okuma Lambası'; newItem.weight = 0.5; newItem.price = 350;
      newItem.elevation = 1.3;
    }
    // SU & ISITMA
    else if (type === 'water_tank') {
      newItem.size = [1.2, 0.4, 0.5]; newItem.color = '#3b82f6'; newItem.name = 'Temiz Su Deposu 200L'; newItem.weight = 205; newItem.price = 3500;
      newItem.placement = 'cabin';
    } else if (type === 'waste_tank') {
      newItem.size = [1.0, 0.3, 0.5]; newItem.color = '#94a3b8'; newItem.name = 'Gri Su Deposu 150L'; newItem.weight = 15; newItem.price = 2200;
      newItem.placement = 'under_floor';
    } else if (type === 'black_water_tank') {
      newItem.size = [0.8, 0.3, 0.4]; newItem.color = '#ef4444'; newItem.name = 'Siyah Su Deposu 100L'; newItem.weight = 10; newItem.price = 1900;
      newItem.placement = 'under_floor';

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
    } else if (type === 'bathroom_cabin') {
      newItem.size = [0.8, 1.9, 0.9]; newItem.color = '#f8fafc'; newItem.name = 'Komple Banyo Kabini'; newItem.weight = 45; newItem.price = 28000;
    }
    // GÜVENLİK & DIŞ
    else if (type === 'fire_ext') {
      newItem.size = [0.15, 0.4, 0.15]; newItem.color = '#ef4444'; newItem.name = 'Yangın Tüpü'; newItem.weight = 2; newItem.price = 600;
    } else if (type === 'sensor') {
      newItem.size = [0.1, 0.05, 0.1]; newItem.color = '#94a3b8'; newItem.name = 'Gaz/Duman Sensörü'; newItem.weight = 0.3; newItem.price = 500;
      newItem.elevation = 1.8;
    } else if (type === 'awning') {
      newItem.size = [3.0, 0.16, 0.16]; newItem.color = '#475569'; newItem.name = 'Dış Tente'; newItem.weight = 25; newItem.price = 16000;
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
      newItem.isOutdoor = true;
    } else if (type === 'outdoor_light') {
      newItem.size = [0.4, 0.05, 0.05]; newItem.color = '#fcd34d'; newItem.name = 'Dış Aydınlatma (LED)'; newItem.weight = 0.5; newItem.price = 800;
      newItem.elevation = 1.8;
      newItem.isOutdoor = true;
    } else if (type === 'outdoor_carpet') {
      newItem.size = [3.0, 0.02, 2.5]; newItem.color = '#4ade80'; newItem.name = 'Yeşil Dış Mekan Halısı'; newItem.weight = 5; newItem.price = 1200;
      newItem.isOutdoor = true;
    } else if (type === 'outdoor_seating') {
      newItem.size = [1.5, 0.7, 1.5]; newItem.color = '#fde047'; newItem.name = 'Bambu Masa Grubu'; newItem.weight = 15; newItem.price = 4500;
      newItem.isOutdoor = true;
    } else if (type === 'bbq') {
      newItem.size = [0.8, 0.9, 0.5]; newItem.color = '#1e293b'; newItem.name = 'Mangal / Dış Mutfak'; newItem.weight = 12; newItem.price = 3000;
      newItem.isOutdoor = true;
    } else if (type === 'outdoor_tv') {
      newItem.size = [0.8, 0.5, 0.05]; newItem.color = '#000000'; newItem.name = 'Dış Mekan TV'; newItem.weight = 5; newItem.price = 6000;
      newItem.elevation = 1.2;
      newItem.isOutdoor = true;
    } else if (type === 'outdoor_stove') {
      newItem.size = [0.4, 1.2, 0.4]; newItem.color = '#475569'; newItem.name = 'Dış Soba'; newItem.weight = 20; newItem.price = 4000;
      newItem.isOutdoor = true;
    } else if (type === 'step') {
      newItem.size = [0.6, 0.1, 0.3]; newItem.color = '#1e293b'; newItem.name = 'Elektrikli Basamak'; newItem.weight = 6; newItem.price = 4500;
    } else if (type === 'water_hose') {
      newItem.size = [0.3, 0.15, 0.3]; newItem.color = '#38bdf8'; newItem.name = 'Temiz Su Dolum Hortumu'; newItem.weight = 2; newItem.price = 400;
    } else if (type === 'power_cable') {
      newItem.size = [0.3, 0.15, 0.3]; newItem.color = '#f87171'; newItem.name = 'Dış Elektrik Kablosu'; newItem.weight = 4; newItem.price = 800;
    } else if (type === 'motorcycle') {
      newItem.size = [1.9, 1.1, 0.75]; newItem.color = '#334155'; newItem.name = 'Yamaha NMAX 155'; newItem.weight = 131; newItem.price = 125000;
      newItem.elevation = 0.5;
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

  const handleLinkOutdoorItems = () => {
    setItems(items.map(item => {
      if (item.isOutdoor) {
        return { ...item, linkedToAwning: true };
      }
      return item;
    }));
    alert('Dış mekan öğeleri başarıyla tenteye bağlandı! Artık tente açılıp kapandığında bu öğeler otomatik gizlenecektir.');
  }

  const selectedItem = items.find(i => i.id === selectedItemId)

  // --- HESAPLAMA MANTIĞI (DİNAMİK) ---
  const { totalCost, totalWeight, leftWeight, rightWeight } = useMemo(() => {
    const isAwningOpen = items.some(i => i.type === 'awning' && i.isOpen);
    
    // Aktif öğeleri belirle (Kapalı olanları veya bağlı olup tentesi kapalı olanları eliyoruz)
    const activeItems = items.filter(item => {
      if (item.type === 'moto_rack' && !item.isOpen) return false;
      if (item.linkedToAwning && !isAwningOpen) return false;
      return true;
    });

    // Hesaplama fonksiyonu (İçerideki gizli ağırlıkları -örn: rack üstündeki motor- da kapsar)
    const calculateStats = (itemList) => {
      let cost = 0;
      let weight = 0;
      let left = 0;
      let right = 0;

      itemList.forEach(item => {
        let itemWeight = item.weight || 0;
        let itemPrice = item.price || 0;

        // Özel Durum: Motosiklet Taşıyıcı üzerindeki otomatik motor
        if (item.type === 'moto_rack' && item.isOpen && item.hasMotorcycle) {
          itemWeight += 131; // NMAX Ağırlığı
          itemPrice += 125000; // NMAX Fiyatı
        }

        // Özel Durum: Kış Bahçesi ve Soba
        if (item.type === 'awning' && item.hasSideWalls) {
          itemWeight += 45; // Çadır ve Soba Ağırlığı (25kg çadır + 20kg soba)
          itemPrice += 12000; // Kış bahçesi ve soba ek maliyeti
        }

        cost += itemPrice;
        weight += itemWeight;
        
        if (item.position[0] < -0.1) {
          left += itemWeight;
        } else if (item.position[0] > 0.1) {
          right += itemWeight;
        }
      });

      return { cost, weight, left, right };
    };

    const stats = calculateStats(activeItems);

    return {
      totalCost: stats.cost,
      totalWeight: stats.weight,
      leftWeight: stats.left,
      rightWeight: stats.right
    };
  }, [items]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#121212] overflow-hidden font-sans text-gray-200">
      <TopBar 
        is3DView={is3DView}
        setIs3DView={setIs3DView}
        vehicles={activeVehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={handleVehicleChange}
        caravanType={caravanType}
        onCaravanTypeChange={handleCaravanTypeChange}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
        onSetDefault={handleSetDefaultProject}
        onNewProject={handleNewProject}
        isNightMode={isNightMode}
        setIsNightMode={setIsNightMode}
        onScreenshot={handleScreenshot}
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
            wallTexture={wallTexture}
            floorTexture={floorTexture}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            onUpdateItemPosition={handleUpdateItemPosition} 
            isNightMode={isNightMode}
            caravanType={caravanType}
            trailerClass={trailerClass}
            trailerShape={trailerShape}
          />
        </div>
        
        <SidebarRight 
          selectedItem={selectedItem}
          vehicle={vehicle}
          onUpdateItem={(props) => handleUpdateItemProperties(selectedItemId, props)}
          onUpdateVehicleSize={handleUpdateVehicleSize}
          caravanType={caravanType}
          trailerClass={trailerClass}
          setTrailerClass={setTrailerClass}
          trailerShape={trailerShape}
          setTrailerShape={setTrailerShape}
          wallTexture={wallTexture}
          onUpdateWallTexture={setWallTexture}
          floorTexture={floorTexture}
          onUpdateFloorTexture={setFloorTexture}
          onDeselect={() => setSelectedItemId(null)}
          onDuplicate={() => handleDuplicateItem(selectedItemId)}
          onRemove={() => handleRemoveItem(selectedItemId)}
          onLinkOutdoorItems={handleLinkOutdoorItems}
        />
      </div>

      {/* Alt Raporlama Çubuğu */}
      <div className="h-10 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-between px-6 text-[11px] font-bold tracking-tight text-gray-400 z-10 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 uppercase opacity-70">Toplam Maliyet:</span>
            <span className="text-white text-sm">{totalCost.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 uppercase opacity-70">Toplam Ağırlık:</span>
            <span className={`text-sm ${totalWeight > 3500 ? 'text-red-500' : 'text-white'}`}>{totalWeight.toLocaleString('tr-TR')} kg</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 uppercase opacity-70">Ağırlık Dengesi:</span>
            <div className="flex items-center bg-[#252525] rounded-full px-4 py-1 gap-5 border border-[#333]">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">SOL</span>
                <span className={`text-xs ${leftWeight > rightWeight + 150 ? 'text-red-400' : 'text-green-400'}`}>{leftWeight.toLocaleString('tr-TR')} kg</span>
              </div>
              <div className="w-px h-3 bg-[#444]"></div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-500">SAĞ</span>
                <span className={`text-xs ${rightWeight > leftWeight + 150 ? 'text-red-400' : 'text-green-400'}`}>{rightWeight.toLocaleString('tr-TR')} kg</span>
              </div>
            </div>
          </div>
          {totalWeight > 3500 && (
            <div className="animate-pulse flex items-center gap-2 bg-red-900/20 text-red-500 px-3 py-1 rounded-md border border-red-900/50">
              <span className="text-[10px] font-black">!!! 3500KG SINIRI AŞILDI !!!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
