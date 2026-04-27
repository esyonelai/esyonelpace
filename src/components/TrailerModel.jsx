import { Edges, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'

export default function TrailerModel({ vehicle, trailerClass = 'O1', trailerShape = 'Standard', wallTexture = 'white', floorTexture = 'wood_oak' }) {
  if (!vehicle) return null;
  const [width, height, length] = vehicle.innerSize;

  const getTextureMaterial = (tex) => {
    switch(tex) {
      case 'wood_oak': return { color: '#d4a373', roughness: 0.6, metalness: 0.1 };
      case 'wood_walnut': return { color: '#6f4e37', roughness: 0.5, metalness: 0.1 };
      case 'fabric_grey': return { color: '#94a3b8', roughness: 1.0, metalness: 0 };
      case 'fabric_beige': return { color: '#d6d3d1', roughness: 1.0, metalness: 0 };
      case 'metal_anthracite': return { color: '#334155', roughness: 0.4, metalness: 0.5 };
      case 'marble_white': return { color: '#f8fafc', roughness: 0.1, metalness: 0.3 };
      default: return { color: '#f8fafc', roughness: 0.9, metalness: 0 };
    }
  };

  const wallMat = getTextureMaterial(wallTexture);
  const floorMat = getTextureMaterial(floorTexture);
  const wallThickness = 0.05;
  const floorThickness = 0.15;
  const outerWidth = width + wallThickness * 2;

  // Çeki Oku (A-Frame)
  const drawbarLength = 1.2;

  // Gövde Şekli Oluşturma (Profil)
  const bodyProfile = useMemo(() => {
    const shape = new THREE.Shape();
    const h = height;
    const l = length;
    const r = 0.3; // Köşe yuvarlama (Standard için)

    if (trailerShape === 'Oval') {
      // Adria Action tarzı kapsül form
      shape.moveTo(-l/2 + 0.5, -h/2);
      shape.lineTo(l/2 - 0.5, -h/2);
      shape.quadraticCurveTo(l/2, -h/2, l/2, 0);
      shape.quadraticCurveTo(l/2, h/2, l/2 - 0.5, h/2);
      shape.lineTo(-l/2 + 0.5, h/2);
      shape.quadraticCurveTo(-l/2, h/2, -l/2, 0);
      shape.quadraticCurveTo(-l/2, -h/2, -l/2 + 0.5, -h/2);
    } else if (trailerShape === 'Aerodynamic') {
      // Adria Adora/Alpina tarzı eğimli ön
      shape.moveTo(-l/2, -h/2);
      shape.lineTo(l/2 - 0.3, -h/2); // Arka alt
      shape.lineTo(l/2, -h/2 + 0.3); // Arka alt köşe
      shape.lineTo(l/2, h/2 - 0.1); // Arka üst
      shape.lineTo(l/2 - 0.1, h/2); // Arka üst köşe
      shape.lineTo(-l/2 + 0.8, h/2); // Tavan önü (Pencere başlangıcı)
      // Sky-view kavisli ön
      shape.quadraticCurveTo(-l/2, h/2, -l/2, -h/2 + 1.0);
      shape.lineTo(-l/2, -h/2);
    } else {
      // Standart Dikdörtgen (Erba tarzı)
      shape.moveTo(-l/2 + r, -h/2);
      shape.lineTo(l/2 - r, -h/2);
      shape.quadraticCurveTo(l/2, -h/2, l/2, -h/2 + r);
      shape.lineTo(l/2, h/2 - r);
      shape.quadraticCurveTo(l/2, h/2, l/2 - r, h/2);
      shape.lineTo(-l/2 + r, h/2);
      shape.quadraticCurveTo(-l/2, h/2, -l/2, h/2 - r);
      shape.lineTo(-l/2, -h/2 + r);
      shape.quadraticCurveTo(-l/2, -h/2, -l/2 + r, -h/2);
    }
    return shape;
  }, [height, length, trailerShape]);

  return (
    <group position={[0, height / 2 + floorThickness, 0]}>
      
      {/* --- ŞASİ VE ÇEKİ OKU --- */}
      <group position={[0, -height/2 - floorThickness, 0]}>
        {/* Ana Şasi Rayları */}
        <mesh position={[-width/3, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.1, length]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[width/3, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.1, length]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        
        {/* Çeki Oku (V-Frame) */}
        <group position={[0, 0.05, -length/2 - drawbarLength/2]}>
          <mesh position={[-width/6, 0, 0]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.08, 0.08, drawbarLength]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[width/6, 0, 0]} rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.08, 0.08, drawbarLength]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Kaplin (Hitch) */}
          <mesh position={[0, 0.05, -drawbarLength/2]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color="#1e293b" metalness={1} />
          </mesh>
          {/* Pilot Tekerlek (Jockey Wheel) */}
          <group position={[0.2, -0.15, -drawbarLength/3]}>
            <mesh><cylinderGeometry args={[0.02, 0.02, 0.4]} /><meshStandardMaterial color="#94a3b8" /></mesh>
            <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.08, 0.08, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
          </group>
        </group>

        {/* Tekerlekler */}
        <group position={[0, 0.1, length/2 - 1.2]}>
          {/* Aks */}
          <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.05, 0.05, outerWidth + 0.2]} /><meshStandardMaterial color="#334155" /></mesh>
          {/* Tekerlekler */}
          <mesh position={[-outerWidth/2 - 0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[outerWidth/2 + 0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Çift Dingil (O2 ise ve uzunsa) */}
          {trailerClass === 'O2' && length > 5 && (
            <group position={[0, 0, 0.7]}>
              <mesh rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[0.05, 0.05, outerWidth + 0.2]} /><meshStandardMaterial color="#334155" /></mesh>
              <mesh position={[-outerWidth/2 - 0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              <mesh position={[outerWidth/2 + 0.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.32, 0.32, 0.2, 32]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* --- GÖVDE (BODY) --- */}
      <group>
        {/* Ana Gövde Kabuğu (Yarı saydam yan duvarlar için Extrude yerıne Mesh kullanıyoruz) */}
        <group rotation={[0, -Math.PI/2, 0]}>
           {/* Sol Duvar */}
           <mesh position={[0, 0, -outerWidth/2 + wallThickness/2]}>
              <shapeGeometry args={[bodyProfile]} />
              <meshStandardMaterial {...wallMat} transparent opacity={0.6} side={THREE.DoubleSide} />
              <Edges color="#e2e8f0" />
           </mesh>
           {/* Sağ Duvar */}
           <mesh position={[0, 0, outerWidth/2 - wallThickness/2]}>
              <shapeGeometry args={[bodyProfile]} />
              <meshStandardMaterial {...wallMat} transparent opacity={0.15} side={THREE.DoubleSide} />
              <Edges color="#94a3b8" />
           </mesh>
        </group>

        {/* Zemin */}
        <mesh receiveShadow position={[0, -height/2 - floorThickness/2, 0]}>
          <boxGeometry args={[width, floorThickness, length]} />
          <meshStandardMaterial {...floorMat} />
        </mesh>

        {/* Tavan ve Ön/Arka Kaplama (Extrude ile kavisli yüzey) */}
        <mesh position={[0, 0, -(outerWidth - 0.1)/2]} rotation={[0, -Math.PI/2, 0]}>
          <extrudeGeometry args={[bodyProfile, { depth: outerWidth - 0.1, bevelEnabled: false }]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        
        {/* --- ÖZEL CAMLAR --- */}
        {trailerShape === 'Aerodynamic' && (
          <group position={[-length/2 + 0.3, height/4 + 0.1, 0]}>
             {/* Sky-View Camı (Bükümlü) */}
             <mesh rotation={[0, 0, -0.6]}>
                <boxGeometry args={[1.2, 0.02, width - 0.4]} />
                <meshPhysicalMaterial color="#000" transmission={0.95} transparent roughness={0.05} />
                <Edges color="#38bdf8" />
             </mesh>
             <Text position={[0.2, 0.6, 0]} rotation={[Math.PI/2, 0, -Math.PI/2]} fontSize={0.1} color="#38bdf8">SKY-VIEW</Text>
          </group>
        )}

        {/* Arka Stoplar */}
        <group position={[length/2 + 0.01, -height/4, 0]}>
          <mesh position={[-0.01, 0, -width/3]}><boxGeometry args={[0.02, 0.4, 0.2]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} /></mesh>
          <mesh position={[-0.01, 0, width/3]}><boxGeometry args={[0.02, 0.4, 0.2]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} /></mesh>
        </group>

        {/* Marka Yazısı */}
        <group position={[-length/2 - 0.01, height/3, 0]} rotation={[0, -Math.PI/2, 0]}>
           <Text fontSize={0.15} color="#3b82f6" font="bold">ESYONEL PACE PRO</Text>
           <Text position={[0, -0.15, 0]} fontSize={0.08} color="#94a3b8">O1 SINIFI ÇEKME KARAVAN</Text>
        </group>
      </group>

    </group>
  );
}
