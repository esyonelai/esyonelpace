import { Edges } from '@react-three/drei'

export default function VanModel({ vehicle }) {
  if (!vehicle) return null;
  const [width, height, length] = vehicle.innerSize;

  // Aracın dış ölçüleri (kaba taslak)
  const wallThickness = 0.05;
  const floorThickness = 0.2;
  const cabinLength = 1.5; // Sürücü kabini uzunluğu
  
  const outerWidth = width + wallThickness * 2;

  return (
    <group position={[0, height / 2 + floorThickness, 0]}>
      
      {/* --- KASA (KARGO ALANI) --- */}
      <group>
        {/* Zemin (Ahşap / Kontrplak Görünümü) */}
        <mesh receiveShadow position={[0, -height / 2 - floorThickness / 2, 0]}>
           <boxGeometry args={[width, floorThickness, length]} />
           <meshStandardMaterial color="#d4a373" transparent={true} opacity={0.15} depthWrite={false} />
           <Edges color="#a0522d" transparent opacity={0.5} />
        </mesh>

        {/* Sol Duvar (İç Kaplama - Beyaz/Açık Gri) - Kamera açısına göre içeriyi görmek için yarı saydam */}
        <mesh receiveShadow castShadow position={[-width / 2 - wallThickness / 2, 0, 0]}>
           <boxGeometry args={[wallThickness, height, length]} />
           <meshStandardMaterial color="#f8fafc" transparent opacity={0.6} depthWrite={false} roughness={0.9} />
           <Edges color="#e2e8f0" />
        </mesh>



        {/* Sağ Duvar (Şeffaf / Açık - Tasarım yapabilmek için) */}
        <mesh position={[width / 2 + wallThickness / 2, 0, 0]}>
           <boxGeometry args={[wallThickness, height, length]} />
           <meshStandardMaterial color="#cbd5e1" transparent opacity={0.1} depthWrite={false} />
           <Edges color="#94a3b8" />
        </mesh>



        {/* Arka Duvar (Kapıların olduğu yer - Beyaz İç Kaplama) */}
        <mesh receiveShadow castShadow position={[0, 0, length / 2 + wallThickness / 2]}>
           <boxGeometry args={[outerWidth, height, wallThickness]} />
           <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.1} depthWrite={false} />
           <Edges color="#94a3b8" />
        </mesh>
        


        {/* Arka Stop Lambaları (Taillights) */}
        <mesh position={[-outerWidth / 2 + 0.15, -height / 3, length / 2 + wallThickness + 0.01]}>
           <planeGeometry args={[0.15, 0.4]} />
           <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[outerWidth / 2 - 0.15, -height / 3, length / 2 + wallThickness + 0.01]}>
           <planeGeometry args={[0.15, 0.4]} />
           <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>

        {/* Tavan (Roof) - İçeriyi görebilmek için şeffaf yapıyoruz */}
        <mesh receiveShadow castShadow position={[0, height / 2 + wallThickness / 2, 0]}>
           <boxGeometry args={[outerWidth, wallThickness, length]} />
           <meshStandardMaterial color="#cbd5e1" transparent opacity={0.05} depthWrite={false} />
           <Edges color="#94a3b8" />
        </mesh>


        {/* Şase (Chassis Rails) */}
        {vehicle.chassis && (
          <group position={[0, -height / 2 - floorThickness - 0.1, 0]}>
            {/* Sol Şase Demiri */}
            <mesh position={[-vehicle.chassis.frameWidth / 2, 0, -cabinLength / 2]}>
               <boxGeometry args={[0.08, 0.15, length + cabinLength]} />
               <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} emissive="#334155" emissiveIntensity={0.5} />
               <Edges color="#cbd5e1" />
            </mesh>
            {/* Sağ Şase Demiri */}
            <mesh position={[vehicle.chassis.frameWidth / 2, 0, -cabinLength / 2]}>
               <boxGeometry args={[0.08, 0.15, length + cabinLength]} />
               <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} emissive="#334155" emissiveIntensity={0.5} />
               <Edges color="#cbd5e1" />
            </mesh>
            {/* Arka Aks (Axle) */}
            <mesh position={[0, 0, length / 2 - 0.8]}>
               <boxGeometry args={[vehicle.chassis.trackWidth, 0.1, 0.1]} />
               <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} emissive="#334155" emissiveIntensity={0.5} />
            </mesh>
            {/* Orta Çapraz Destek (Crossmember) */}
            <mesh position={[0, 0, 0]}>
               <boxGeometry args={[vehicle.chassis.frameWidth, 0.08, 0.15]} />
               <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} emissive="#334155" emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}
      </group>

      {/* --- ALKOVEN (YATAK BÖLÜMÜ) --- Sadece Alkovenli tiplerde */}
      {vehicle.type === 'alkovenli' && (
        <group position={[0, height / 4, -length / 2 - cabinLength / 2]}>
          <mesh receiveShadow castShadow>
            {/* Alkoven Kutusu */}
            <boxGeometry args={[outerWidth, height / 2, cabinLength]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.6} depthWrite={false} />
            <Edges color="#e2e8f0" />
          </mesh>
        </group>
      )}

      {/* --- SÜRÜCÜ KABİNİ (ÖN TARAF) --- */}
      <group position={[0, -height / 4, -length / 2 - cabinLength / 2]}>
        
        {/* Ana Kabin (Şoför Mahalli) */}
        <mesh receiveShadow castShadow position={[0, 0, 0.25]}>
          <boxGeometry args={[vehicle.type === 'alkovenli' ? 2.0 : outerWidth, height / 2, 1.0]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          <Edges color="#e2e8f0" />
        </mesh>
        
        {/* Motor Kaputu (Hood) */}
        {vehicle.id !== 'isuzu_npr' && (
          <mesh receiveShadow castShadow position={[0, -height / 8 + 0.05, -0.45]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[vehicle.type === 'alkovenli' ? 2.0 : outerWidth, height / 4, 0.7]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            <Edges color="#e2e8f0" />
          </mesh>
        )}

        {/* Eğimli Ön Cam (Windshield) */}
        {vehicle.id !== 'isuzu_npr' && (
          <mesh position={[0, height / 8 + 0.1, -0.28]} rotation={[-0.35, 0, 0]}>
            <planeGeometry args={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) - 0.1, height / 3 + 0.15]} />
            <meshPhysicalMaterial color="#000000" transmission={0.9} transparent roughness={0.05} metalness={0.5} envMapIntensity={2} />
          </mesh>
        )}
        
        {/* Yan Camlar */}
        <mesh position={[-(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 - 0.01, height / 8, 0.25]}>
           <planeGeometry args={[0.8, height / 3]} rotation={[0, -Math.PI/2, 0]} />
           <meshPhysicalMaterial color="#000000" transmission={0.9} transparent roughness={0.05} metalness={0.5} envMapIntensity={2} />
        </mesh>
        <mesh position={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 + 0.01, height / 8, 0.25]}>
           <planeGeometry args={[0.8, height / 3]} rotation={[0, Math.PI/2, 0]} />
           <meshPhysicalMaterial color="#000000" transmission={0.9} transparent roughness={0.05} metalness={0.5} envMapIntensity={2} />
        </mesh>

        {/* Yan Aynalar (Side Mirrors) - Kalın ve büyük */}
        <mesh position={[-(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 - 0.2, height / 8, -0.1]}>
           <boxGeometry args={[0.4, 0.4, 0.15]} />
           <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>
        <mesh position={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 + 0.2, height / 8, -0.1]}>
           <boxGeometry args={[0.4, 0.4, 0.15]} />
           <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>

        {/* Ön Devasa Siyah Tampon (Bumper) */}
        <mesh position={[0, -height / 4 + 0.05, -0.65]}>
           <boxGeometry args={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) + 0.02, 0.4, 0.5]} />
           <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.2} />
        </mesh>

        {/* Ön Izgara (Grill) */}
        <mesh position={[0, -height / 4 + 0.1, -0.91]}>
           <planeGeometry args={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) - 0.4, 0.2]} />
           <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>

        {/* Farlar (Headlights) */}
        <mesh position={[-(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 + 0.25, -height / 8 + 0.05, -0.76]} rotation={[0.2, 0, 0]}>
           <planeGeometry args={[0.3, 0.15]} />
           <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[(vehicle.type === 'alkovenli' ? 2.0 : outerWidth) / 2 - 0.25, -height / 8 + 0.05, -0.76]} rotation={[0.2, 0, 0]}>
           <planeGeometry args={[0.3, 0.15]} />
           <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* --- TEKERLEKLER (WHEELS) --- */}
      {vehicle.chassis && (
        <group position={[0, -height / 2 - floorThickness - 0.35, 0]}>
          {/* Arka Sol Tekerlek */}
          <mesh position={[-vehicle.chassis.trackWidth / 2, 0, length / 2 - 1.0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
             <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Arka Sağ Tekerlek */}
          <mesh position={[vehicle.chassis.trackWidth / 2, 0, length / 2 - 1.0]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
             <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Ön Sol Tekerlek */}
          <mesh position={[-vehicle.chassis.trackWidth / 2, 0, length / 2 - 1.0 - vehicle.chassis.wheelbase]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
             <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          {/* Ön Sağ Tekerlek */}
          <mesh position={[vehicle.chassis.trackWidth / 2, 0, length / 2 - 1.0 - vehicle.chassis.wheelbase]} rotation={[0, 0, Math.PI / 2]}>
             <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
             <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        </group>
      )}



    </group>
  )
}
