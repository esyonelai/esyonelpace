import { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'

export default function Furniture({ item, vehicle, isSelected, onSelect, onUpdatePosition, onDragStart, onDragEnd }) {
  const meshRef = useRef()
  const { size: [w, h, d], color, type, rotation } = item
  const [isDragging, setIsDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { raycaster, camera, pointer } = useThree()
  
  const isUnderFloor = item.placement === 'under_floor'
  const isRoof = item.placement === 'roof'
  const vehicleHeight = vehicle ? vehicle.innerSize[1] : 2.0
  const floorThickness = 0.2
  const wallThickness = 0.05
  
  let planeY = 0.2
  if (isUnderFloor) planeY = -h - 0.05
  else if (isRoof) planeY = vehicleHeight + floorThickness + wallThickness / 2
  
  const currentY = planeY + (item.elevation || 0)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), currentY)
  
  const currentRotY = rotation ? rotation[1] : 0
  const isRotated90 = Math.abs(Math.sin(currentRotY)) > 0.5
  const boundW = isRotated90 ? d : w
  const boundD = isRotated90 ? w : d

  const handlePointerDown = (e) => {
    e.stopPropagation()
    onSelect()
    setIsDragging(true)
    if (onDragStart) onDragStart()
    document.body.style.cursor = 'grabbing'
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (isDragging && vehicle) {
      e.stopPropagation()
      raycaster.setFromCamera(pointer, camera)
      const target = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, target)
      if (target) {
        const [vW, , vL] = vehicle.innerSize
        let x = target.x
        let z = target.z
        
        let maxX, maxZ;
        if (isUnderFloor && vehicle.chassis) {
          maxX = (vehicle.chassis.trackWidth / 2) - (boundW / 2);
          maxZ = (vehicle.chassis.wheelbase / 2) - (boundD / 2);
        } else {
          maxX = (vW/2) - (boundW/2);
          maxZ = (vL/2) - (boundD/2);
        }
        
        x = Math.max(-maxX, Math.min(maxX, x))
        z = Math.max(-maxZ, Math.min(maxZ, z))

        meshRef.current.position.set(x, currentY, z)
      }
    }
  }

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.stopPropagation()
      setIsDragging(false)
      if (onDragEnd) onDragEnd()
      document.body.style.cursor = hovered ? 'grab' : 'crosshair'
      e.target.releasePointerCapture(e.pointerId)
      if (meshRef.current) {
        onUpdatePosition([meshRef.current.position.x, item.position[1] || 0, meshRef.current.position.z])
      }
    }
  }

  let displayColor = color
  if (isDragging) displayColor = '#fbbf24'
  else if (isSelected) displayColor = '#60a5fa' 
  else if (hovered) displayColor = '#fcd34d'

  const pos = [item.position[0], currentY, item.position[2]]
  const edgeColor = isSelected ? "#2563eb" : (isDragging ? "#d97706" : "#475569");

  // Eşya Tipi Göre Çizim
  const renderDetailedModel = () => {
      // ---- MOBİLYA ----
    if (type === 'bed') {
      return (
        <group position={[0, h/2, 0]}>
          {/* 4 Adet Bacak (Legs) */}
          <mesh castShadow receiveShadow position={[-w/2 + 0.05, -h/4, -d/2 + 0.05]}>
             <boxGeometry args={[0.05, h/2, 0.05]} />
             <meshStandardMaterial color={displayColor} roughness={0.8} />
          </mesh>
          <mesh castShadow receiveShadow position={[w/2 - 0.05, -h/4, -d/2 + 0.05]}>
             <boxGeometry args={[0.05, h/2, 0.05]} />
             <meshStandardMaterial color={displayColor} roughness={0.8} />
          </mesh>
          <mesh castShadow receiveShadow position={[-w/2 + 0.05, -h/4, d/2 - 0.05]}>
             <boxGeometry args={[0.05, h/2, 0.05]} />
             <meshStandardMaterial color={displayColor} roughness={0.8} />
          </mesh>
          <mesh castShadow receiveShadow position={[w/2 - 0.05, -h/4, d/2 - 0.05]}>
             <boxGeometry args={[0.05, h/2, 0.05]} />
             <meshStandardMaterial color={displayColor} roughness={0.8} />
          </mesh>

          {/* İnce Ahşap Taşıyıcı Platform (Frame) */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[w, 0.1, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.6} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {/* Yatak/Sünger (Mattress) */}
          <mesh castShadow receiveShadow position={[0, h/4 + 0.05, 0]}>
            <boxGeometry args={[w - 0.04, h/2 - 0.1, d - 0.04]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          {/* Yastıklar */}
          <mesh castShadow receiveShadow position={[-w/4, h/2 + 0.05, -d/2 + 0.25]}>
            <boxGeometry args={[w/2 - 0.1, 0.15, 0.35]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh castShadow receiveShadow position={[w/4, h/2 + 0.05, -d/2 + 0.25]}>
            <boxGeometry args={[w/2 - 0.1, 0.15, 0.35]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      )
    } else if (type === 'high_bed') {
      return (
        <group position={[0, h/2, 0]}>
          {/* İnce Ahşap Taşıyıcı Platform */}
          <mesh castShadow receiveShadow position={[0, -h/4 + 0.05, 0]}>
            <boxGeometry args={[w, 0.1, d]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
            <Edges scale={1.001} color="#5c3a21" />
          </mesh>
          {/* Yatak/Sünger (Mattress) */}
          <mesh castShadow receiveShadow position={[0, h/4, 0]}>
            <boxGeometry args={[w - 0.04, h/2, d - 0.04]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
          {/* Yastıklar */}
          <mesh castShadow receiveShadow position={[-w/4, h/2 + 0.05, -d/2 + 0.25]}>
            <boxGeometry args={[w/2 - 0.1, 0.15, 0.35]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <mesh castShadow receiveShadow position={[w/4, h/2 + 0.05, -d/2 + 0.25]}>
            <boxGeometry args={[w/2 - 0.1, 0.15, 0.35]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      )
    } else if (type === 'kitchen') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
            <boxGeometry args={[w, h - 0.1, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.4} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, h/2 - 0.05, 0]}>
            <boxGeometry args={[w + 0.02, 0.1, d + 0.02]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
          </mesh>
          <mesh position={[-w/3, h/2, 0]}>
            <boxGeometry args={[0.35, 0.02, 0.35]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            <mesh position={[0, 0.1, -0.1]}>
               <cylinderGeometry args={[0.02, 0.02, 0.2]} />
               <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
          </mesh>
          <mesh position={[w/3, h/2, 0]}>
            <boxGeometry args={[0.45, 0.02, 0.4]} />
            <meshStandardMaterial color="#020617" roughness={0.1} />
            <mesh position={[-0.12, 0.015, -0.1]}>
               <cylinderGeometry args={[0.07, 0.07, 0.01, 16]} />
               <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.12, 0.015, 0.1]}>
               <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
               <meshStandardMaterial color="#ef4444" />
            </mesh>
          </mesh>
        </group>
      )
    } else if (type === 'cabinet') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.5} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh position={[-w/4, 0, d/2 + 0.01]}>
            <boxGeometry args={[w/2 - 0.02, h - 0.04, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          <mesh position={[w/4, 0, d/2 + 0.01]}>
            <boxGeometry args={[w/2 - 0.02, h - 0.04, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
        </group>
      )
    } 
    // ---- BEYAZ EŞYA ----
    else if (type === 'washing_machine' || type === 'dishwasher') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.2} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {type === 'washing_machine' ? (
            <>
              <mesh position={[0, -0.05, d/2 + 0.01]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[w/3, w/3, 0.02, 32]} />
                 <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[0, -0.05, d/2 + 0.015]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[w/4, w/4, 0.02, 32]} />
                 <meshStandardMaterial color="#0f172a" />
              </mesh>
            </>
          ) : (
            <mesh position={[0, -0.1, d/2 + 0.01]}>
              <boxGeometry args={[w - 0.05, h - 0.2, 0.02]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          )}
          {/* Kontrol Paneli */}
          <mesh position={[0, h/2 - 0.06, d/2 + 0.01]}>
             <boxGeometry args={[w - 0.02, 0.12, 0.02]} />
             <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      )
    } else if (type === 'fridge') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.2} metalness={0.1} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh position={[0, h/4, d/2 + 0.01]}>
             <boxGeometry args={[w - 0.02, h/2 - 0.02, 0.02]} />
             <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -h/4, d/2 + 0.01]}>
             <boxGeometry args={[w - 0.02, h/2 - 0.02, 0.02]} />
             <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      )
    }
    // ---- SU & ISITMA ----
    else if (type === 'water_tank' || type === 'waste_tank' || type === 'black_water_tank') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.5} transparent={type === 'water_tank'} opacity={type === 'water_tank' ? 0.8 : 1} />
            <Edges scale={1.001} color={type === 'black_water_tank' ? '#333333' : '#0284c7'} />
          </mesh>
          {/* Su dolum kapağı (sadece temiz ve gri su için olabilir ama hepsine de eklenebilir) */}
          <mesh position={[w/3, h/2 + 0.02, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04]} />
            <meshStandardMaterial color={type === 'black_water_tank' ? '#ef4444' : '#ef4444'} />
          </mesh>
        </group>
      )
    } else if (type === 'toilet') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, -0.05]}>
            <boxGeometry args={[w, h/2, d - 0.1]} />
            <meshStandardMaterial color={displayColor} roughness={0.1} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {/* Oturak */}
          <mesh castShadow receiveShadow position={[0, 0, 0.05]}>
            <boxGeometry args={[w - 0.05, 0.05, d - 0.1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </mesh>
          {/* Sırtlık / Kaset kutusu */}
          <mesh position={[0, h/4, -d/2 + 0.1]}>
            <boxGeometry args={[w, h/2, 0.2]} />
            <meshStandardMaterial color={displayColor} roughness={0.1} />
          </mesh>
        </group>
      )
    }
    // ---- ENERJİ ----
    else if (type === 'solar_panel') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {/* Hücreler */}
          <mesh position={[0, h/2 + 0.005, 0]}>
            <boxGeometry args={[w - 0.05, 0.01, d - 0.05]} />
            <meshStandardMaterial color={displayColor} roughness={0.1} metalness={0.3} />
            {/* Izgara çizgileri Edges ile simüle edilebilir */}
            <Edges color="#bae6fd" />
          </mesh>
        </group>
      )
    } else if (type === 'battery' || type === 'inverter') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.8} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {/* Kutuplar / Portlar */}
          <mesh position={[-w/3, h/2 + 0.02, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[w/3, h/2 + 0.02, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </group>
      )
    }
    // ---- ÇATI & DIŞ DONANIMLAR ----
    else if (type === 'tv_antenna') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, 0]}>
            <cylinderGeometry args={[w/4, w/3, h/2]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, h/4, 0]}>
             <cylinderGeometry args={[w/2, w/2, 0.05]} />
             <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      )
    } else if (type === 'roof_vent') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, 0]}>
            <boxGeometry args={[w, h/2, d]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, h/4, 0]} rotation={[0.1, 0, 0]}>
             <boxGeometry args={[w+0.05, 0.05, d+0.05]} />
             <meshStandardMaterial color="#f8fafc" transparent opacity={0.7} />
          </mesh>
        </group>
      )
    } else if (type === 'water_heater') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.4} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh position={[0, h/4, d/2 + 0.01]}>
             <boxGeometry args={[w/2, h/3, 0.02]} />
             <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      )
    }
    // ---- PENCERELER ----
    else if (type === 'window') {
      const frameThickness = 0.04;
      return (
        <group position={[0, h/2, 0]}>
          {/* Cam */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshPhysicalMaterial color="#000000" transmission={0.95} transparent roughness={0.05} metalness={0.5} envMapIntensity={2} />
          </mesh>
          {/* Çerçeveler */}
          <mesh position={[0, h/2 + frameThickness/2, 0]}><boxGeometry args={[w + frameThickness*2, frameThickness, d+0.01]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[0, -h/2 - frameThickness/2, 0]}><boxGeometry args={[w + frameThickness*2, frameThickness, d+0.01]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[-w/2 - frameThickness/2, 0, 0]}><boxGeometry args={[frameThickness, h, d+0.01]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[w/2 + frameThickness/2, 0, 0]}><boxGeometry args={[frameThickness, h, d+0.01]} /><meshStandardMaterial color="#0f172a" /></mesh>
        </group>
      )
    }
    // ---- DİĞER (Standart Kutu) ----

    else {
      return (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={displayColor} roughness={0.3} transparent opacity={isDragging ? 0.8 : 1} />
          <Edges scale={1.001} color={edgeColor} />
        </mesh>
      )
    }
  }

  return (
    <group 
      ref={meshRef}
      position={pos}
      rotation={[0, currentRotY, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        if (!isDragging) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        setHovered(false)
        if (!isDragging) document.body.style.cursor = 'crosshair'
      }}
    >
      {renderDetailedModel()}
    </group>
  )
}
