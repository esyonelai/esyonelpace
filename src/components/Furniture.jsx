import { useRef, useState, Suspense, Component } from 'react'
import { useThree } from '@react-three/fiber'
import { Edges, useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'

// Hata Yakalayıcı Bileşeni (ErrorBoundary)
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Model yükleme hatası:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Dinamik Model Yükleyici
function ModelLoader({ url, size, color }) {
  const { scene } = useGLTF(url)
  const [w, h, d] = size
  
  // Modeli boyutlandır ve merkeze al
  const clonedScene = scene.clone()
  
  // Orijinal boyutları hesapla
  const box = new THREE.Box3().setFromObject(clonedScene)
  const center = box.getCenter(new THREE.Vector3())
  const boxSize = box.getSize(new THREE.Vector3())
  
  // 0'a bölme hatasını engelle
  const sx = boxSize.x === 0 ? 1 : w / boxSize.x
  const sy = boxSize.y === 0 ? 1 : h / boxSize.y
  const sz = boxSize.z === 0 ? 1 : d / boxSize.z
  const scale = Math.min(sx, sy, sz)
  
  // Modeli merkeze çek (Pivot düzeltme)
  clonedScene.position.x -= center.x * scale
  clonedScene.position.y -= (center.y - boxSize.y/2) * scale // Tabana oturt
  clonedScene.position.z -= center.z * scale
  
  return <primitive object={clonedScene} scale={scale} />
}

export default function Furniture({ item, vehicle, isSelected, onSelect, onUpdatePosition, onDragStart, onDragEnd, isNightMode }) {
  const meshRef = useRef()
  const { size: [w, h, d], color, type, rotation, modelUrl, texture } = item
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3())
  const [hovered, setHovered] = useState(false)
  const { raycaster, camera, pointer } = useThree()

  const getTextureProperties = (tex) => {
    switch(tex) {
      case 'wood_oak': return { roughness: 0.6, metalness: 0.1 };
      case 'wood_walnut': return { roughness: 0.5, metalness: 0.1 };
      case 'fabric_grey': return { roughness: 1.0, metalness: 0 };
      case 'fabric_beige': return { roughness: 1.0, metalness: 0 };
      case 'metal_anthracite': return { roughness: 0.4, metalness: 0.5 };
      case 'marble_white': return { roughness: 0.1, metalness: 0.3 };
      default: return { roughness: 0.5, metalness: 0 };
    }
  };

  const textureProps = getTextureProperties(texture);
  
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
    
    // Tıklanan dünya koordinatı ile eşya merkezi arasındaki farkı bul
    raycaster.setFromCamera(pointer, camera)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)
    if (target) {
      const offset = new THREE.Vector3().copy(target).sub(meshRef.current.position)
      setDragOffset(offset)
    }

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
        
        // Offset'i çıkararak eşyanın tıklandığı yerin mouse altında kalmasını sağla
        let x = target.x - dragOffset.x
        let z = target.z - dragOffset.z
        
        // Sınırları genişlet (Aracın dışına çıkabilmesi için)
        const outerLimitX = 5.0; 
        const outerLimitZ = 10.0; 
        
        x = Math.max(-outerLimitX, Math.min(outerLimitX, x))
        z = Math.max(-outerLimitZ, Math.min(outerLimitZ, z))

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
  // Artık seçim yapıldığında rengi değiştirmiyoruz, sadece kenarlıkları (Edges) belirginleştiriyoruz.
  const edgeColor = isSelected ? "#3b82f6" : (isDragging ? "#fbbf24" : (hovered ? "#fcd34d" : "#444"));
  const edgeOpacity = isSelected || isDragging || hovered ? 1 : 0.4;
  const pos = [item.position[0], currentY, item.position[2]]

  const getDoorColor = (baseColor) => {
    try {
      const c = new THREE.Color(baseColor);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      if (hsl.l > 0.4) {
        c.setHSL(hsl.h, hsl.s, hsl.l * 0.4); // Koyu yap
      } else {
        c.setHSL(hsl.h, hsl.s, Math.min(1.0, hsl.l + 0.4)); // Açık yap (kontrast)
      }
      return '#' + c.getHexString();
    } catch(e) {
      return baseColor;
    }
  };

  const renderDetailedModel = () => {
    // ---- MOBİLYA ----
    if (type === 'bed' || type === 'high_bed') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4 + 0.05, 0]}>
            <boxGeometry args={[w, 0.1, d]} />
            <meshStandardMaterial color={type === 'high_bed' ? "#8b5a2b" : displayColor} {...textureProps} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, h/4, 0]}>
            <boxGeometry args={[w - 0.04, h/2, d - 0.04]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} />
          </mesh>
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
    } else if (type === 'seat_l') {
      const seatHeight = 0.4;
      const cushionThickness = 0.12;
      const backrestHeight = 0.45;
      const benchDepth = Math.min(w, d) * 0.45;
      return (
        <group position={[0, h/2, 0]}>
          <group position={[0, -h/2 + seatHeight/2, 0]}>
            <mesh castShadow receiveShadow position={[0, 0, -d/2 + benchDepth/2]}>
              <boxGeometry args={[w, seatHeight, benchDepth]} />
              <meshStandardMaterial color={displayColor} />
              <Edges scale={1.001} color={edgeColor} />
            </mesh>
            <mesh castShadow receiveShadow position={[w/2 - benchDepth/2, 0, d/2 - (d - benchDepth)/2]}>
              <boxGeometry args={[benchDepth, seatHeight, d - benchDepth]} />
              <meshStandardMaterial color={displayColor} />
              <Edges scale={1.001} color={edgeColor} />
            </mesh>
          </group>
          <group position={[0, -h/2 + seatHeight + cushionThickness/2, 0]}>
            <mesh castShadow receiveShadow position={[0, 0, -d/2 + benchDepth/2]}>
              <boxGeometry args={[w - 0.02, cushionThickness, benchDepth - 0.02]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh castShadow receiveShadow position={[w/2 - benchDepth/2, 0, d/2 - (d - benchDepth)/2]}>
              <boxGeometry args={[benchDepth - 0.02, cushionThickness, d - benchDepth - 0.02]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
          <group position={[0, -h/2 + seatHeight + cushionThickness + backrestHeight/2, 0]}>
            <mesh castShadow receiveShadow position={[0, 0, -d/2 + 0.05]}>
              <boxGeometry args={[w, backrestHeight, 0.1]} />
              <meshStandardMaterial color={displayColor} />
            </mesh>
            <mesh castShadow receiveShadow position={[w/2 - 0.05, 0, d/2 - (d - benchDepth)/2]}>
              <boxGeometry args={[0.1, backrestHeight, d - benchDepth]} />
              <meshStandardMaterial color={displayColor} />
            </mesh>
          </group>
        </group>
      )
    } else if (type === 'double_seat') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/2 + 0.15, 0]}>
            <boxGeometry args={[w * 0.8, 0.3, d * 0.6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
            <Edges scale={1.001} color="#000" />
          </mesh>
          <mesh castShadow receiveShadow position={[-w/4, -0.05, 0.05]}>
            <boxGeometry args={[w/2 - 0.04, 0.2, d - 0.1]} />
            <meshStandardMaterial color={displayColor} roughness={0.9} />
          </mesh>
          <mesh castShadow receiveShadow position={[w/4, -0.05, 0.05]}>
            <boxGeometry args={[w/2 - 0.04, 0.2, d - 0.1]} />
            <meshStandardMaterial color={displayColor} roughness={0.9} />
          </mesh>
          <group position={[0, 0.35, -d/2 + 0.1]} rotation={[-0.15, 0, 0]}>
             <mesh castShadow receiveShadow position={[-w/4, 0, 0]}><boxGeometry args={[w/2 - 0.04, 0.8, 0.15]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
             <mesh castShadow receiveShadow position={[w/4, 0, 0]}><boxGeometry args={[w/2 - 0.04, 0.8, 0.15]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
             <mesh castShadow receiveShadow position={[-w/4, 0.5, 0]}><boxGeometry args={[0.25, 0.2, 0.1]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
             <mesh castShadow receiveShadow position={[w/4, 0.5, 0]}><boxGeometry args={[0.25, 0.2, 0.1]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
          </group>
        </group>
      )
    } else if (type === 'swivel_seat') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/2 + 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0]}><boxGeometry args={[w, 0.2, d]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
          <mesh castShadow receiveShadow position={[0, 0.4, -d/2 + 0.1]} rotation={[-0.1, 0, 0]}><boxGeometry args={[w, 0.8, 0.15]} /><meshStandardMaterial color={displayColor} roughness={0.9} /></mesh>
        </group>
      )
    } else if (type === 'wardrobe' || type === 'cabinet' || type === 'bathroom_cabinet' || type === 'shoe_rack' || type === 'overhead_cabinet') {
      const isOpen = item.isOpen ?? false;
      const isOverhead = type === 'overhead_cabinet';
      
      return (
        <group position={[0, h/2, 0]}>
          {/* Gövde */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} {...textureProps} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          
          {/* Kapak (Hinge Logic) */}
          <group 
            position={isOverhead ? [0, h/2, d/2] : [-w/2, 0, d/2]} 
            rotation={isOpen ? (isOverhead ? [-Math.PI/2, 0, 0] : [0, -Math.PI/1.5, 0]) : [0, 0, 0]}
          >
            <mesh position={isOverhead ? [0, -h/2, 0.01] : [w/2, 0, 0.01]}>
              <boxGeometry args={[w, h, 0.02]} />
              <meshStandardMaterial 
                color={type === 'bathroom_cabinet' ? getDoorColor("#e2e8f0") : getDoorColor(color)} 
                metalness={type === 'bathroom_cabinet' ? 0.9 : 0.1} 
                roughness={type === 'bathroom_cabinet' ? 0.1 : 0.5} 
                {...textureProps}
              />
              {/* Kulp */}
              <mesh position={isOverhead ? [0, -h + 0.1, 0.02] : [w/2 - 0.1, 0, 0.02]}>
                <boxGeometry args={[0.02, 0.15, 0.02]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
            </mesh>
          </group>
        </group>
      )
    } else if (type === 'kitchen') {
      const isOpen = item.isOpen ?? false;
      const counterHeight = 0.1;
      const bodyHeight = h - counterHeight;
      
      // Standart Bulaşık Makinesi Ölçüleri
      const DW_WIDTH = 0.6; 
      const DW_HEIGHT = 0.82; 
      
      const dwWidth = w > DW_WIDTH ? DW_WIDTH : w * 0.6; 
      const drawersWidth = w - dwWidth;
      
      const drawerCount = item.drawerCount || 3;
      const sideDrawerHeight = bodyHeight / drawerCount;
      const slideDistBase = isOpen ? d * 0.4 : 0;

      // Bulaşık makinesi üzerine çekmece (15cm sabit)
      const topDrawerHeight = 0.15;
      const hasTopDrawer = true;
      
      return (
        <group position={[0, h/2, 0]}>
          {/* Tezgah */}
          <mesh castShadow receiveShadow position={[0, h/2 - counterHeight/2, 0]}>
            <boxGeometry args={[w + 0.02, counterHeight, d + 0.02]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
          </mesh>
          
          {/* Ana Gövde */}
          <group position={[0, -counterHeight/2, 0]}>
             {/* Paneller */}
             <mesh castShadow receiveShadow position={[-w/2 + 0.01, 0, 0]}><boxGeometry args={[0.02, bodyHeight, d]} /><meshStandardMaterial color={displayColor} {...textureProps} /></mesh>
             <mesh castShadow receiveShadow position={[w/2 - 0.01, 0, 0]}><boxGeometry args={[0.02, bodyHeight, d]} /><meshStandardMaterial color={displayColor} {...textureProps} /></mesh>
             <mesh castShadow receiveShadow position={[0, 0, -d/2 + 0.01]}><boxGeometry args={[w, bodyHeight, 0.02]} /><meshStandardMaterial color={displayColor} {...textureProps} /></mesh>
             <mesh castShadow receiveShadow position={[0, -bodyHeight/2 + 0.02, 0]}><boxGeometry args={[w, 0.04, d]} /><meshStandardMaterial color={displayColor} {...textureProps} /></mesh>
             
             {/* Orta Bölme */}
             <mesh castShadow receiveShadow position={[-w/2 + dwWidth, 0, 0]}><boxGeometry args={[0.02, bodyHeight, d]} /><meshStandardMaterial color={displayColor} {...textureProps} /></mesh>

             {/* Bulaşık Makinesi Üstü Çekmece (Varsa) */}
             {hasTopDrawer && (
               <group position={[-w/2 + dwWidth/2, bodyHeight/2 - topDrawerHeight/2, isOpen ? slideDistBase : 0]}>
                  <mesh castShadow receiveShadow><boxGeometry args={[dwWidth - 0.04, topDrawerHeight - 0.02, d - 0.04]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, d/2 - 0.01]}><boxGeometry args={[dwWidth - 0.02, topDrawerHeight - 0.01, 0.02]} /><meshStandardMaterial color={getDoorColor(displayColor)} {...textureProps} /></mesh>
                  <mesh castShadow receiveShadow position={[0, 0, d/2 + 0.01]}><boxGeometry args={[0.1, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
               </group>
             )}
             
             {/* Yan Çekmeceler (Üst Üste ve Yan Yana) */}
             <group position={[-w/2 + dwWidth, -bodyHeight/2, 0]}>
               {(() => {
                 const columnCount = Math.max(1, Math.floor(drawersWidth / 0.4));
                 const colWidth = drawersWidth / columnCount;
                 const rows = Array.from({ length: drawerCount });
                 const cols = Array.from({ length: columnCount });
                 
                 return cols.map((_, colIdx) => (
                   <group key={`col-${colIdx}`} position={[colIdx * colWidth + colWidth/2, bodyHeight/2, 0]}>
                     {rows.map((_, rowIdx) => {
                        const posY = bodyHeight/2 - sideDrawerHeight/2 - rowIdx * sideDrawerHeight;
                        const slideDist = isOpen ? (slideDistBase + rowIdx * 0.05) : 0;
                        return (
                          <group key={`row-${rowIdx}`} position={[0, posY, slideDist]}>
                            <mesh castShadow receiveShadow position={[0, 0, 0]}><boxGeometry args={[colWidth - 0.04, sideDrawerHeight - 0.02, d - 0.04]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
                            <mesh castShadow receiveShadow position={[0, 0, d/2 - 0.01]}><boxGeometry args={[colWidth - 0.02, sideDrawerHeight - 0.01, 0.02]} /><meshStandardMaterial color={getDoorColor(displayColor)} {...textureProps} /></mesh>
                            <mesh castShadow receiveShadow position={[0, 0, d/2 + 0.01]}><boxGeometry args={[Math.min(0.15, colWidth * 0.6), 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
                          </group>
                        )
                     })}
                   </group>
                 ));
               })()}
             </group>
          </group>
        </group>
      )
    } else if (type === 'table_telescopic') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -0.05, 0]}><cylinderGeometry args={[0.06, 0.08, h - 0.1, 16]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} /></mesh>
          <mesh castShadow receiveShadow position={[0, -h/2 + 0.01, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 32]} /><meshStandardMaterial color="#1e293b" metalness={0.5} /></mesh>
          <mesh castShadow receiveShadow position={[0, h/2 - 0.02, 0]}><boxGeometry args={[w, 0.04, d]} /><meshStandardMaterial color={displayColor} roughness={0.3} /><Edges scale={1.001} color={edgeColor} /></mesh>
        </group>
      )
    } else if (type === 'washing_machine' || type === 'dishwasher' || type === 'fridge' || type === 'oven') {
      const isOpen = item.isOpen ?? false;
      const isOven = type === 'oven';
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={displayColor} roughness={0.2} /><Edges scale={1.001} color={edgeColor} /></mesh>
          
          {/* Kapak */}
          <group 
            position={isOven ? [0, -h/2, d/2] : [w/2, 0, d/2]} 
            rotation={isOpen ? (isOven ? [Math.PI/2, 0, 0] : [0, Math.PI/1.5, 0]) : [0, 0, 0]}
          >
            <mesh position={isOven ? [0, h/2, 0.01] : [-w/2, 0, 0.01]}>
              <boxGeometry args={[w - 0.04, isOven ? h : h - 0.15, 0.02]} />
              <meshStandardMaterial color={isOven ? "#0f172a" : "#f8fafc"} transparent={isOven} opacity={isOven ? 0.7 : 1} />
            </mesh>
          </group>
          <mesh position={[0, h/2 - 0.08, d/2 + 0.02]}><boxGeometry args={[w - 0.02, 0.12, 0.02]} /><meshStandardMaterial color="#1e293b" /></mesh>
        </group>
      )
    } else if (type === 'kitchen_sink') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, 0.1, d]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0, 0.1, -d/3]}><cylinderGeometry args={[0.02, 0.02, 0.25]} /><meshStandardMaterial color="#cbd5e1" metalness={0.9} /></mesh>
          <mesh position={[0, 0.25, -d/6]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.9} /></mesh>
        </group>
      )
    } else if (type === 'kitchen_stove') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, 0.05, d]} /><meshStandardMaterial color="#020617" roughness={0.1} /></mesh>
          {/* 4'lü Ocak Gözleri */}
          <mesh position={[-w/4, 0.03, -d/4]}><cylinderGeometry args={[w/8, w/8, 0.01, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[w/4, 0.03, -d/4]}><cylinderGeometry args={[w/10, w/10, 0.01, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[-w/4, 0.03, d/4]}><cylinderGeometry args={[w/10, w/10, 0.01, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[w/4, 0.03, d/4]}><cylinderGeometry args={[w/12, w/12, 0.01, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
        </group>
      )
    } else if (type === 'trash_bin') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><cylinderGeometry args={[w/2, w/2.2, h, 16]} /><meshStandardMaterial color={displayColor} roughness={0.8} /></mesh>
          <mesh position={[0, h/2, 0]}><cylinderGeometry args={[w/1.9, w/1.9, 0.05, 16]} /><meshStandardMaterial color="#334155" /></mesh>
        </group>
      )
    } else if (type === 'shower_tray') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#f8fafc" roughness={0.1} /></mesh>
          <mesh position={[0, h/2 + 0.01, 0]}><cylinderGeometry args={[0.05, 0.05, 0.01]} /><meshStandardMaterial color="#94a3b8" metalness={0.8} /></mesh>
        </group>
      )
    } else if (type === 'toilet') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, -0.05]}><boxGeometry args={[w, h/2, d - 0.1]} /><meshStandardMaterial color={displayColor} roughness={0.1} /><Edges scale={1.001} color={edgeColor} /></mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.05]}><boxGeometry args={[w - 0.05, 0.05, d - 0.1]} /><meshStandardMaterial color="#ffffff" roughness={0.1} /></mesh>
          <mesh position={[0, h/4, -d/2 + 0.1]}><boxGeometry args={[w, h/2, 0.2]} /><meshStandardMaterial color={displayColor} roughness={0.1} /></mesh>
        </group>
      )
    } else if (type === 'water_tank' || type === 'waste_tank' || type === 'black_water_tank' || type === 'boiler') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow>
            {type === 'boiler' ? <cylinderGeometry args={[w/2, w/2, h, 24]} /> : <boxGeometry args={[w, h, d]} />}
            <meshStandardMaterial color={displayColor} roughness={0.5} transparent={type === 'water_tank'} opacity={type === 'water_tank' ? 0.8 : 1} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          <mesh position={[0, h/2 + 0.02, 0]}><cylinderGeometry args={[0.05, 0.05, 0.05]} /><meshStandardMaterial color="#ef4444" /></mesh>
        </group>
      )
    } else if (type === 'heater') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#1e293b" /></mesh>
          <mesh position={[0, 0, d/2 + 0.01]}><boxGeometry args={[w*0.9, h*0.8, 0.01]} /><meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={isNightMode ? 1.5 : 0.3} /></mesh>
          <mesh position={[w/2, 0, 0]}><cylinderGeometry args={[h/3, h/3, 0.05]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#475569" /></mesh>
        </group>
      )
    } else if (type === 'water_hose' || type === 'power_cable') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[w/3, 0.05, 12, 24]} /><meshStandardMaterial color={displayColor} /></mesh>
          <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]} position={[0, 0.06, 0]}><torusGeometry args={[w/3.2, 0.05, 12, 24]} /><meshStandardMaterial color={displayColor} /></mesh>
        </group>
      )
    } else if (type === 'solar_panel') {
      const isOpen = item.isOpen ?? false;
      const panelCount = item.panelCount || 1;
      const openingSide = item.openingSide || 'both'; // 'left', 'right', 'both'
      const slideDist = isOpen ? d * 0.95 : 0;

      return (
        <group position={[0, h/2, 0]}>
          {/* Orta Sabit Panel */}
          <group position={[0, 0, 0]}>
            <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
            <mesh position={[0, h/2 + 0.005, 0]}><boxGeometry args={[w - 0.05, 0.01, d - 0.05]} /><meshStandardMaterial color={displayColor} roughness={0.1} metalness={0.3} /><Edges color="#bae6fd" /></mesh>
          </group>
          
          {/* Sol Açılır Panel (Eğer panel sayısı > 1 ve yön uygunsa) */}
          {panelCount >= 2 && (openingSide === 'left' || openingSide === 'both') && (
            <group position={[0, -0.02, -slideDist]}>
              <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
              <mesh position={[0, h/2 + 0.005, 0]}><boxGeometry args={[w - 0.05, 0.01, d - 0.05]} /><meshStandardMaterial color={displayColor} roughness={0.1} metalness={0.3} /><Edges color="#bae6fd" /></mesh>
              {/* Bağlantı Rayı */}
              <mesh position={[0, 0, slideDist/2]}><boxGeometry args={[0.05, 0.02, slideDist]} /><meshStandardMaterial color="#475569" /></mesh>
            </group>
          )}

          {/* Sağ Açılır Panel (Eğer panel sayısı 3 ve yön uygunsa) */}
          {panelCount === 3 && (openingSide === 'right' || openingSide === 'both') && (
            <group position={[0, -0.04, slideDist]}>
              <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
              <mesh position={[0, h/2 + 0.005, 0]}><boxGeometry args={[w - 0.05, 0.01, d - 0.05]} /><meshStandardMaterial color={displayColor} roughness={0.1} metalness={0.3} /><Edges color="#bae6fd" /></mesh>
              {/* Bağlantı Rayı */}
              <mesh position={[0, 0, -slideDist/2]}><boxGeometry args={[0.05, 0.02, slideDist]} /><meshStandardMaterial color="#475569" /></mesh>
            </group>
          )}
        </group>
      )
    } else if (type === 'battery' || type === 'inverter' || type === 'router') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={displayColor} roughness={0.8} /><Edges scale={1.001} color={edgeColor} /></mesh>
          {type === 'router' && <mesh position={[0, h/2 + 0.1, 0]}><cylinderGeometry args={[0.01, 0.01, 0.3]} /><meshStandardMaterial color="#1e293b" /></mesh>}
          {type === 'inverter' && <group position={[w/2 + 0.01, 0, 0]}><mesh><boxGeometry args={[0.02, h*0.8, d*0.8]} /><meshStandardMaterial color="#94a3b8" /></mesh></group>}
        </group>
      )
    } else if (type === 'power_outlet' || type === 'control_panel') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={displayColor} /></mesh>
          <mesh position={[0, 0, d/2 + 0.01]}><boxGeometry args={[w*0.8, h*0.8, 0.01]} /><meshStandardMaterial color="#1e293b" /></mesh>
        </group>
      )
    } else if (type === 'sensor') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><cylinderGeometry args={[w/2, w/2, h, 16]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[0, 0, w/2]}><boxGeometry args={[0.05, 0.05, 0.05]} /><meshStandardMaterial color="#ef4444" /></mesh>
        </group>
      )
    } else if (type === 'awning') {
      const isOpen = item.isOpen ?? false;
      const extension = item.extension || 2.5; 
      const slopeDrop = 0.2; // 20 cm yere doğru eğim
      const slopeAngle = Math.atan2(slopeDrop, extension); // Pozitif açı = aşağı eğim
      
      const casingOffsetZ = 0.1;
      const casingOffsetY = 0.08;
      const tipZ = casingOffsetZ + extension * Math.cos(slopeAngle);
      const tipY = casingOffsetY - extension * Math.sin(slopeAngle); // Eğim aşağı olduğu için -

      return (
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
            <boxGeometry args={[w, 0.1, 0.25]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          
          {isOpen && (
            <group>
              <group position={[0, casingOffsetY, casingOffsetZ]} rotation={[slopeAngle, 0, 0]}>
                <mesh position={[0, 0, extension / 2]}>
                  <boxGeometry args={[w - 0.05, 0.01, extension]} />
                  <meshStandardMaterial color="#94a3b8" transparent opacity={0.95} side={THREE.DoubleSide} />
                </mesh>
                
                {/* Tente Üzerine Yazı */}
                <group position={[0, 0.02, extension / 2]} rotation={[-Math.PI/2, 0, 0]}>
                  <Text
                    position={[0, 0.2, 0]}
                    fontSize={0.2}
                    color="#ff0000"
                    anchorX="center"
                    anchorY="middle"
                  >
                    @EsyonelpacePro
                  </Text>
                  <Text
                    position={[0, -0.1, 0]}
                    fontSize={0.12}
                    color="#ff0000"
                    anchorX="center"
                    anchorY="middle"
                  >
                    2026 Ahmet Vural
                  </Text>
                </group>

                <mesh position={[0, 0, extension]}>
                  <boxGeometry args={[w, 0.08, 0.08]} />
                  <meshStandardMaterial color="#475569" />
                </mesh>
              </group>
              
              <mesh position={[w/2 - 0.15, (-currentY + tipY)/2, tipZ]}>
                <cylinderGeometry args={[0.02, 0.015, currentY + tipY]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              <mesh position={[-w/2 + 0.15, (-currentY + tipY)/2, tipZ]}>
                <cylinderGeometry args={[0.02, 0.015, currentY + tipY]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>

              {/* --- KIŞ BAHÇESİ (Çadır Yan Duvarları) --- */}
              {item.hasSideWalls === true && (
                <group key={`garden-group-${item.id}`}>
                  {/* Kış Bahçesi İçindeki Otomatik Soba */}
                  <group position={[w/2 - 0.5, -currentY + 0.35, 0.5]}>
                    <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
                      <cylinderGeometry args={[0.12, 0.12, 0.35, 16]} />
                      <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.5} />
                    </mesh>
                    <mesh position={[0, -0.1, 0.12]}>
                      <boxGeometry args={[0.1, 0.1, 0.01]} />
                      <meshStandardMaterial color="#0f172a" />
                    </mesh>
                    <mesh position={[0, -0.1, 0.11]}>
                      <sphereGeometry args={[0.05]} />
                      <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={isNightMode ? 4 : 0.5} />
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                      <cylinderGeometry args={[0.02, 0.02, 1.2]} />
                      <meshStandardMaterial color="#334155" metalness={0.8} />
                    </mesh>
                  </group>


                  {(() => {
                    const h1 = currentY + casingOffsetY;
                    const h2 = currentY + tipY;
                    const wallColor = item.gardenColor || "#cbd5e1";
                    const winW = tipZ * 0.7;
                    const winH = (h1 + h2) * 0.35;

                    const renderSideWallWithHole = (isLeft) => {
                      const shape = new THREE.Shape();
                      shape.moveTo(0, -currentY); // Arka Alt (Zemin)
                      shape.lineTo(tipZ, -currentY); // Ön Alt (Zemin)
                      shape.lineTo(tipZ, tipY); // Ön Üst (Tente ucu)
                      shape.lineTo(0, casingOffsetY); // Arka Üst (Karavan bağlantısı)
                      shape.lineTo(0, -currentY);

                      const averageRoofY = (casingOffsetY + tipY) / 2;
                      const centerY = (-currentY + averageRoofY) / 2;
                      const winW = tipZ * 0.6;
                      const winH = (currentY + averageRoofY) * 0.4;
                      
                      const winZStart = tipZ / 2 - winW / 2;
                      const winZEnd = tipZ / 2 + winW / 2;
                      const winYStart = centerY - winH / 2;
                      const winYEnd = centerY + winH / 2;

                      // Pencere boşluğu
                      const hole = new THREE.Path();
                      hole.moveTo(winZStart, winYStart);
                      hole.lineTo(winZEnd, winYStart);
                      hole.lineTo(winZEnd, winYEnd);
                      hole.lineTo(winZStart, winYEnd);
                      hole.lineTo(winZStart, winYStart);
                      shape.holes.push(hole);

                      return (
                        <group position={[isLeft ? -w/2 + 0.02 : w/2 - 0.02, 0, 0]}>
                          <mesh rotation={[0, -Math.PI/2, 0]}>
                            <shapeGeometry args={[shape]} />
                            <meshStandardMaterial color={wallColor} transparent opacity={0.8} side={THREE.DoubleSide} />
                          </mesh>
                          
                          {/* Pencere Çerçevesi ve Izgarası */}
                          <group position={[isLeft ? 0.01 : -0.01, centerY, tipZ/2]}>
                            <group rotation={[0, Math.PI/2, 0]}>
                              <mesh><boxGeometry args={[winW, 0.01, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              <mesh><boxGeometry args={[0.01, winH, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              {/* Dış Çerçeve */}
                              <mesh position={[0, winH/2, 0]}><boxGeometry args={[winW, 0.01, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              <mesh position={[0, -winH/2, 0]}><boxGeometry args={[winW, 0.01, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              <mesh position={[winW/2, 0, 0]}><boxGeometry args={[0.01, winH, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              <mesh position={[-winW/2, 0, 0]}><boxGeometry args={[0.01, winH, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                            </group>
                          </group>
                        </group>
                      );
                    };

                    return (
                      <group>
                        {renderSideWallWithHole(true)}
                        {renderSideWallWithHole(false)}
                      </group>
                    );
                  })()}

                  {/* Ön Duvar (Gerçek Boşluklu) */}
                  <group position={[0, (-currentY + tipY)/2, tipZ]}>
                    {(() => {
                      const doorW = 0.9;
                      const fixedPartW = w - doorW;
                      const hFront = currentY + tipY;
                      const wallColor = item.gardenColor || "#cbd5e1";

                      return (
                        <group>
                          {/* Sabit Kısım (4 Parçalı Boşluklu Panel) */}
                          <group position={[-(w/2 - fixedPartW/2), 0, 0]}>
                            {/* Üst */}
                            <mesh position={[0, hFront * 0.35, 0]}>
                              <boxGeometry args={[fixedPartW, hFront * 0.3, 0.01]} />
                              <meshStandardMaterial color={wallColor} transparent opacity={0.8} />
                            </mesh>
                            {/* Alt */}
                            <mesh position={[0, -hFront * 0.35, 0]}>
                              <boxGeometry args={[fixedPartW, hFront * 0.3, 0.01]} />
                              <meshStandardMaterial color={wallColor} transparent opacity={0.8} />
                            </mesh>
                            {/* Yanlar */}
                            <mesh position={[-fixedPartW * 0.4, 0, 0]}>
                              <boxGeometry args={[fixedPartW * 0.2, hFront * 0.4, 0.01]} />
                              <meshStandardMaterial color={wallColor} transparent opacity={0.8} />
                            </mesh>
                            <mesh position={[fixedPartW * 0.4, 0, 0]}>
                              <boxGeometry args={[fixedPartW * 0.2, hFront * 0.4, 0.01]} />
                              <meshStandardMaterial color={wallColor} transparent opacity={0.8} />
                            </mesh>
                            {/* Pencere Çerçevesi (Boş) */}
                            <group position={[0, 0, 0.01]}>
                              <Edges color="#38bdf8" />
                              <mesh><boxGeometry args={[fixedPartW * 0.6, 0.01, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              <mesh><boxGeometry args={[0.01, hFront * 0.4, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                            </group>
                          </group>

                          {/* KAPI (Penceresi Gerçek Delik) */}
                          <group 
                            position={[w/2, 0, 0]} 
                            rotation={[0, item.isGardenDoorOpen ? -Math.PI/1.5 : 0, 0]}
                          >
                            <group position={[-doorW/2, 0, 0]}>
                              {/* Kapı Panelleri */}
                              <mesh position={[0, hFront * 0.4, 0]}>
                                <boxGeometry args={[doorW, hFront * 0.2, 0.02]} />
                                <meshStandardMaterial color={wallColor} transparent opacity={0.5} />
                              </mesh>
                              <mesh position={[0, -hFront * 0.4, 0]}>
                                <boxGeometry args={[doorW, hFront * 0.2, 0.02]} />
                                <meshStandardMaterial color={wallColor} transparent opacity={0.5} />
                              </mesh>
                              <mesh position={[-doorW * 0.4, 0, 0]}>
                                <boxGeometry args={[doorW * 0.2, hFront * 0.6, 0.02]} />
                                <meshStandardMaterial color={wallColor} transparent opacity={0.5} />
                              </mesh>
                              <mesh position={[doorW * 0.4, 0, 0]}>
                                <boxGeometry args={[doorW * 0.2, hFront * 0.6, 0.02]} />
                                <meshStandardMaterial color={wallColor} transparent opacity={0.5} />
                              </mesh>
                              {/* Kapı Pencere Çerçevesi (Boş) */}
                              <group position={[0, 0, 0.02]}>
                                <Edges color="#38bdf8" />
                                <mesh><boxGeometry args={[doorW * 0.6, 0.01, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                                <mesh><boxGeometry args={[0.01, hFront * 0.6, 0.01]} /><meshStandardMaterial color="#38bdf8" /></mesh>
                              </group>
                            </group>
                          </group>
                        </group>
                      );
                    })()}
                  </group>
                </group>
              )}
            </group>
          )}
        </group>
      )
    } else if (type === 'moto_rack') {
      const isOpen = item.isOpen ?? false;
      const hasMotorcycle = item.hasMotorcycle ?? false;
      // Kapandığında karavana doğru (-90 derece) katlanması için açı.
      const foldAngle = isOpen ? 0 : -Math.PI / 2;

      return (
        <group position={[0, h/2, -d/2]} rotation={[foldAngle, 0, 0]}>
          <group position={[0, 0, d/2]}>
            {/* Ana Platform */}
            <mesh castShadow receiveShadow><boxGeometry args={[w, 0.05, d]} /><meshStandardMaterial color="#1e293b" metalness={0.8} /></mesh>
            <mesh position={[0, -0.05, -d/2 + 0.025]}><boxGeometry args={[w*0.9, 0.05, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
            
            {/* Açık olduğunda ve ayar seçili olduğunda otomatik Motosiklet */}
            {(isOpen && hasMotorcycle) && (
              <group position={[0, 0.425, 0]}>
                <group scale={[0.8, 0.8, 0.8]} rotation={[0, 0, 0]}>
                  {/* --- YENİ DETAYLI SPORT/ENDURO MOTOSİKLET --- */}
                  <mesh castShadow receiveShadow position={[0, -0.1, 0]}><boxGeometry args={[0.35, 0.25, 0.15]} /><meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.6} /></mesh>
                  <mesh position={[0, -0.1, 0.08]}><cylinderGeometry args={[0.08, 0.08, 0.02]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#334155" metalness={0.9} /></mesh>
                  <mesh position={[0, -0.1, -0.08]}><cylinderGeometry args={[0.08, 0.08, 0.02]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#334155" metalness={0.9} /></mesh>
                  <mesh castShadow receiveShadow position={[0.1, 0.15, 0]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.35, 0.2, 0.18]} /><meshStandardMaterial color={displayColor} roughness={0.3} metalness={0.4} /><Edges scale={1.02} color="#000000" /></mesh>
                  <group position={[0.45, 0.25, 0]} rotation={[0, 0, -0.4]}>
                    <mesh castShadow><boxGeometry args={[0.2, 0.2, 0.16]} /><meshStandardMaterial color={displayColor} roughness={0.3} /></mesh>
                    <mesh position={[0.1, -0.02, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.02, 0.05, 0.12]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} /></mesh>
                    <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.01, 0.15, 0.1]} /><meshPhysicalMaterial color="#000" transmission={0.9} transparent opacity={0.6} /></mesh>
                  </group>
                  <mesh castShadow receiveShadow position={[-0.2, 0.15, 0]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.3, 0.08, 0.12]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
                  <mesh castShadow receiveShadow position={[-0.45, 0.2, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.06, 0.1]} /><meshStandardMaterial color={displayColor} roughness={0.3} /></mesh>
                  <mesh position={[-0.58, 0.23, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.02, 0.04, 0.08]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} /></mesh>
                  <group position={[0.65, -0.25, 0]}>
                    <mesh castShadow rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.18, 0.04, 16, 32]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, Math.PI/2]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
                  </group>
                  <group position={[-0.6, -0.25, 0]}>
                    <mesh castShadow rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.18, 0.05, 16, 32]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.06, 16]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
                    <mesh rotation={[Math.PI/2, 0, Math.PI/2]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
                  </group>
                  <group position={[0.6, 0.1, 0]} rotation={[0, 0, -0.3]}>
                    <mesh castShadow position={[0, 0, 0.06]}><cylinderGeometry args={[0.015, 0.015, 0.6]} /><meshStandardMaterial color="#facc15" metalness={0.6} /></mesh>
                    <mesh castShadow position={[0, 0, -0.06]}><cylinderGeometry args={[0.015, 0.015, 0.6]} /><meshStandardMaterial color="#facc15" metalness={0.6} /></mesh>
                  </group>
                  <group position={[-0.3, -0.15, 0]} rotation={[0, 0, -0.1]}>
                    <mesh castShadow position={[-0.15, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.35]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
                    <mesh castShadow position={[-0.15, 0, -0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.35]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
                  </group>
                  <mesh castShadow receiveShadow position={[-0.5, -0.1, 0.12]} rotation={[0, 0.1, 0.3]}><cylinderGeometry args={[0.04, 0.05, 0.45, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#475569" metalness={0.8} /></mesh>
                  <group position={[0.45, 0.4, 0]}>
                    <mesh castShadow><cylinderGeometry args={[0.015, 0.015, 0.4, 12]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#1e293b" /></mesh>
                    <mesh position={[0, 0, 0.2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12]} /><meshStandardMaterial color="#000" /></mesh>
                    <mesh position={[0, 0, -0.2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12]} /><meshStandardMaterial color="#000" /></mesh>
                  </group>
                </group>
              </group>
            )}
          </group>
        </group>
      )
    } else if (type === 'step') {
      const isOpen = item.isOpen ?? false;
      const stepCount = item.stepCount || 1;
      const slideProgress = isOpen ? 1 : 0;

      return (
        <group position={[0, h/2, 0]}>
          {/* Basamak Kasası / Sabit Üst Plaka */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[w + 0.05, 0.04, d + 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          
          {/* Hareketli Basamaklar */}
          {Array.from({ length: stepCount }).map((_, i) => {
            const targetY = - (i + 1) * 0.15;
            const targetZ = (i + 1) * 0.25;
            
            return (
              <group key={i} position={[0, targetY * slideProgress, targetZ * slideProgress]}>
                 {/* Basamak Plakası */}
                 <mesh castShadow receiveShadow>
                   <boxGeometry args={[w, 0.04, d]} />
                   <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
                   <Edges color="#334155" />
                 </mesh>
                 {/* Yan Kollar / Mekanizma */}
                 <mesh position={[w/2 - 0.01, -targetY/2 * slideProgress, -targetZ/2 * slideProgress]}>
                    <boxGeometry args={[0.02, Math.abs(targetY), 0.02]} />
                    <meshStandardMaterial color="#0f172a" />
                 </mesh>
                 <mesh position={[-w/2 + 0.01, -targetY/2 * slideProgress, -targetZ/2 * slideProgress]}>
                    <boxGeometry args={[0.02, Math.abs(targetY), 0.02]} />
                    <meshStandardMaterial color="#0f172a" />
                 </mesh>
                 {/* Sarı Uyarı Şeridi */}
                 <mesh position={[0, 0.021, d/2 - 0.02]}>
                   <boxGeometry args={[w - 0.1, 0.005, 0.02]} />
                   <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
                 </mesh>
              </group>
            )
          })}
        </group>
      )
    } else if (type === 'outdoor_carpet') {
      return (
        <group position={[0, 0, 0]}>
          <mesh receiveShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} roughness={0.9} />
            <Edges color="#22c55e" />
          </mesh>
        </group>
      )
    } else if (type === 'outdoor_seating') {
      const r = Math.min(w, d) / 2.5; // Daha geniş masa üstü
      return (
        <group position={[0, h/2, 0]}>
          {/* Yuvarlak Bambu Masa */}
          <mesh castShadow receiveShadow position={[0, h/2 - 0.02, 0]}><cylinderGeometry args={[r, r, 0.04, 32]} /><meshStandardMaterial color="#d97706" roughness={0.8} /></mesh>
          {/* 4 Adet Gerçekçi Kalın Masa Ayağı */}
          <mesh position={[r*0.6, 0, r*0.6]}><cylinderGeometry args={[0.03, 0.03, h]} /><meshStandardMaterial color="#78350f" /></mesh>
          <mesh position={[-r*0.6, 0, r*0.6]}><cylinderGeometry args={[0.03, 0.03, h]} /><meshStandardMaterial color="#78350f" /></mesh>
          <mesh position={[r*0.6, 0, -r*0.6]}><cylinderGeometry args={[0.03, 0.03, h]} /><meshStandardMaterial color="#78350f" /></mesh>
          <mesh position={[-r*0.6, 0, -r*0.6]}><cylinderGeometry args={[0.03, 0.03, h]} /><meshStandardMaterial color="#78350f" /></mesh>
          
          {/* 4 Adet Plastik Sandalye */}
          {[[1,0],[0,1],[-1,0],[0,-1]].map((pos, i) => (
            <group key={i} position={[pos[0] * (r + 0.35), -h/2 + 0.45/2, pos[1] * (r + 0.35)]} rotation={[0, Math.atan2(-pos[0], -pos[1]), 0]}>
               <mesh castShadow><boxGeometry args={[0.4, 0.45, 0.4]} /><meshStandardMaterial color={displayColor} roughness={0.5} /></mesh>
               <mesh castShadow position={[0, 0.3, -0.15]}><boxGeometry args={[0.4, 0.4, 0.05]} /><meshStandardMaterial color={displayColor} roughness={0.5} /></mesh>
            </group>
          ))}
        </group>
      )
    } else if (type === 'bbq') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, 0.3, d]} /><meshStandardMaterial color={displayColor} roughness={0.8} /></mesh>
          <mesh position={[0, 0.16, 0]}><boxGeometry args={[w-0.05, 0.02, d-0.05]} /><meshStandardMaterial color="#475569" metalness={0.8} /></mesh>
          <mesh position={[-w/2+0.05, -h/2+0.15, 0]}><cylinderGeometry args={[0.02, 0.02, h-0.3]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[w/2-0.05, -h/2+0.15, 0]}><cylinderGeometry args={[0.02, 0.02, h-0.3]} /><meshStandardMaterial color="#334155" /></mesh>
        </group>
      )
    } else if (type === 'tv') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[0, 0, d/2+0.005]}><boxGeometry args={[w-0.05, h-0.05, 0.01]} /><meshStandardMaterial color="#1e293b" emissive="#1e293b" emissiveIntensity={isNightMode ? 0.8 : 0} /></mesh>
        </group>
      )
    } else if (type === 'outdoor_tv') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[0, 0, d/2+0.005]}><boxGeometry args={[w-0.05, h-0.05, 0.01]} /><meshStandardMaterial color="#1e293b" emissive="#1e293b" emissiveIntensity={isNightMode ? 0.8 : 0} /></mesh>
        </group>
      )
    } else if (type === 'outdoor_stove') {
      const pipeRadius = 0.04; // Boru daha ince yapıldı
      const vertPipeH = h * 1.6; // Kış bahçesi yan duvarı seviyesine çekildi
      const horizPipeL = 1.0;  // 1 metre dışarı çıkış
      return (
        <group position={[0, h/2, 0]}>
          {/* Gövde */}
          <mesh castShadow receiveShadow position={[0, -h/4, 0]}><cylinderGeometry args={[w/2, w/2, h/2, 16]} /><meshStandardMaterial color={displayColor} roughness={0.9} metalness={0.5} /></mesh>
          {/* Kapak */}
          <mesh position={[0, -h/4, w/2]}><boxGeometry args={[w*0.4, h*0.3, 0.02]} /><meshStandardMaterial color="#1e293b" /></mesh>
          {/* Ateş Parıltısı */}
          <mesh position={[0, -h/4, w/2 - 0.05]}><sphereGeometry args={[w/5]} /><meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={isNightMode ? 3 : 0} /></mesh>
          
          {/* Baca (Dikey Uzun Kısım) */}
          <mesh position={[0, vertPipeH/2, 0]}><cylinderGeometry args={[pipeRadius, pipeRadius, vertPipeH]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
          {/* Baca Dirseği (Köşe - L dönüşü) */}
          <mesh position={[0, vertPipeH, 0]}><sphereGeometry args={[pipeRadius]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
          {/* Baca (Yatay Dışarı Çıkan Kısım) */}
          <mesh position={[horizPipeL/2, vertPipeH, 0]} rotation={[0, 0, Math.PI/2]}><cylinderGeometry args={[pipeRadius, pipeRadius, horizPipeL]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
        </group>
      )
    } else if (type === 'outdoor_table') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, h/2 - 0.02, 0]}><boxGeometry args={[w, 0.04, d]} /><meshStandardMaterial color={displayColor} /></mesh>
          <mesh position={[-w/2+0.05, 0, -d/2+0.05]}><boxGeometry args={[0.05, h, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[w/2-0.05, 0, -d/2+0.05]}><boxGeometry args={[0.05, h, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[-w/2+0.05, 0, d/2-0.05]}><boxGeometry args={[0.05, h, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[w/2-0.05, 0, d/2-0.05]}><boxGeometry args={[0.05, h, 0.05]} /><meshStandardMaterial color="#334155" /></mesh>
        </group>
      )
    } else if (type === 'fire_ext') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><cylinderGeometry args={[w/2, w/2, h, 16]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[0, h/2 + 0.05, 0]}><boxGeometry args={[0.1, 0.1, 0.2]} /><meshStandardMaterial color="#1e293b" /></mesh>
        </group>
      )
    } else if (type === 'ac') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#f8fafc" roughness={0.2} /></mesh>
          <mesh position={[0, 0, d/2]}><boxGeometry args={[w*0.8, h*0.6, 0.05]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        </group>
      )
    } else if (type === 'reading_light') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh position={[0, -h/2, 0]}><cylinderGeometry args={[0.05, 0.05, 0.02]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.01, 0.01, h]} /><meshStandardMaterial color="#334155" /></mesh>
          <mesh position={[0, h/2, 0]} rotation={[0, 0, Math.PI/4]}><cylinderGeometry args={[0.04, 0.04, 0.1]} /><meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={isNightMode ? 2 : 0.5} /></mesh>
        </group>
      )
    } else if (type === 'outdoor_light') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh><boxGeometry args={[w, h, d]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
          <mesh position={[0, 0, d/2]}><boxGeometry args={[w*0.9, h*0.5, 0.02]} /><meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.8} /></mesh>
        </group>
      )
    } else if (type === 'window') {
      const frameThickness = 0.04;
      const windowDepth = 0.02;
      const isOpen = item.isOpen ?? false;
      
      // Duvar tespiti (Sadece şeffaflık/renk için)
      const [vW, , vL] = vehicle ? vehicle.innerSize : [1.7, 2, 4];
      const threshold = 0.25; 
      const isOnWall = Math.abs(item.position[0] - (-vW/2)) < threshold || 
                       Math.abs(item.position[0] - (vW/2)) < threshold || 
                       Math.abs(item.position[2] - (vL/2)) < threshold;

      // Açılma açısı (Daima yerel X ekseninde, üstten menteşeli)
      const openRotation = isOpen ? [-Math.PI / 3, 0, 0] : [0, 0, 0];

      return (
        <group position={[0, h/2, 0]}>
          {/* Pencere Kasası / Çerçevesi (Sabit) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[w + frameThickness, h + frameThickness, windowDepth + 0.01]} />
            <meshStandardMaterial color="#0f172a" />
            <Edges color="#334155" />
          </mesh>

          {/* Hareketli Cam Panel */}
          <group 
            position={[0, h/2, 0]} // Üst Menteşe Noktası
            rotation={openRotation}
          >
            <mesh castShadow receiveShadow position={[0, -h/2, 0]}>
              <boxGeometry args={[w, h, windowDepth]} />
              <meshPhysicalMaterial 
                color="#bae6fd" 
                transmission={0.9} 
                transparent 
                opacity={0.5}
                roughness={0.1} 
                metalness={0.2} 
                envMapIntensity={1} 
              />
              <Edges color="#38bdf8" />

              {/* Cam Üzerindeki Çizgiler (Izgara) */}
              <group position={[0, 0, 0.011]}>
                <mesh position={[0, h/4, 0]}><boxGeometry args={[w, 0.005, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
                <mesh position={[0, 0, 0]}><boxGeometry args={[w, 0.005, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
                <mesh position={[0, -h/4, 0]}><boxGeometry args={[w, 0.005, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
                
                <mesh position={[w/4, 0, 0]}><boxGeometry args={[0.005, h, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
                <mesh position={[0, 0, 0]}><boxGeometry args={[0.005, h, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
                <mesh position={[-w/4, 0, 0]}><boxGeometry args={[0.005, h, 0.001]} /><meshStandardMaterial color="#38bdf8" transparent opacity={0.6} /></mesh>
              </group>
            </mesh>
          </group>
        </group>
      )
    } else if (type === 'tv_antenna') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, 0]}><cylinderGeometry args={[w/4, w/3, h/2]} /><meshStandardMaterial color="#cbd5e1" roughness={0.3} /><Edges scale={1.001} color={edgeColor} /></mesh>
          <mesh castShadow receiveShadow position={[0, h/4, 0]}><cylinderGeometry args={[w/2, w/2, 0.05]} /><meshStandardMaterial color="#f8fafc" /></mesh>
        </group>
      )
    } else if (type === 'gas_tank') {
      const tankType = item.tankType || 'household_tank';
      
      return (
        <group position={[0, h/2, 0]}>
          {tankType === 'spherical' && (
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[w/2, 32, 32]} />
              <meshStandardMaterial color={displayColor} roughness={0.3} metalness={0.5} />
              <Edges scale={1.001} color={edgeColor} />
            </mesh>
          )}
          {tankType === 'torus' && (
            <mesh castShadow receiveShadow rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[w/3, w/6, 16, 32]} />
              <meshStandardMaterial color={displayColor} roughness={0.3} metalness={0.5} />
              <Edges scale={1.001} color={edgeColor} />
            </mesh>
          )}
          {tankType === 'vertical_cylinder' && (
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[w/2, w/2, h, 24]} />
              <meshStandardMaterial color={displayColor} roughness={0.3} metalness={0.5} />
              <Edges scale={1.001} color={edgeColor} />
            </mesh>
          )}
          {tankType === 'household_tank' && (
            <group>
               {/* Ana Gövde */}
               <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
                 <cylinderGeometry args={[w/2, w/2, h - 0.2, 24]} />
                 <meshStandardMaterial color={displayColor} roughness={0.4} metalness={0.2} />
               </mesh>
               {/* Üst Kısım (Kubbe) */}
               <mesh castShadow receiveShadow position={[0, h/2 - 0.2, 0]}>
                 <sphereGeometry args={[w/2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
                 <meshStandardMaterial color={displayColor} />
               </mesh>
               {/* Alt Çember */}
               <mesh castShadow receiveShadow position={[0, -h/2 + 0.05, 0]}>
                 <cylinderGeometry args={[w/2.2, w/2.2, 0.1, 24, 1, true]} />
                 <meshStandardMaterial color="#334155" />
               </mesh>
               {/* Üst Koruma */}
               <mesh castShadow receiveShadow position={[0, h/2 - 0.05, 0]}>
                 <cylinderGeometry args={[w/3, w/3, 0.1, 24, 1, true]} />
                 <meshStandardMaterial color="#334155" />
               </mesh>
               {/* Vana */}
               <mesh position={[0, h/2 - 0.05, 0]}><boxGeometry args={[0.05, 0.05, 0.05]} /><meshStandardMaterial color="#ef4444" /></mesh>
            </group>
          )}
        </group>
      )
    } else if (type === 'roof_vent') {
      return (
        <group position={[0, h/2, 0]}>
          <mesh castShadow receiveShadow position={[0, -h/4, 0]}><boxGeometry args={[w, h/2, d]} /><meshStandardMaterial color="#e2e8f0" roughness={0.8} /><Edges scale={1.001} color={edgeColor} /></mesh>
          <mesh castShadow receiveShadow position={[0, h/4, 0]} rotation={[0.1, 0, 0]}><boxGeometry args={[w+0.05, 0.05, d+0.05]} /><meshStandardMaterial color="#f8fafc" transparent opacity={0.7} /></mesh>
        </group>
      )
    } else if (type === 'bathroom_cabin') {
      const isOpen = item.isOpen ?? false;
      return (
        <group position={[0, h/2, 0]}>
          {/* Dış Kabin Duvarları */}
          <mesh receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={displayColor} transparent opacity={0.4} />
            <Edges scale={1.001} color={edgeColor} />
          </mesh>
          {/* Zemin */}
          <mesh position={[0, -h/2 + 0.05, 0]}>
            <boxGeometry args={[w-0.02, 0.1, d-0.02]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Klozet */}
          <group position={[0, -h/2 + 0.25, d/4]}>
            <mesh><boxGeometry args={[0.35, 0.4, 0.4]} /><meshStandardMaterial color="#ffffff" /></mesh>
          </group>
          {/* Lavabo */}
          <group position={[w/2 - 0.2, 0.1, -d/4]}>
            <mesh><boxGeometry args={[0.3, 0.1, 0.3]} /><meshStandardMaterial color="#ffffff" /></mesh>
          </group>
          
          {/* Kapı Pivotu */}
          <group 
            position={[-w/2 + 0.01, 0, d/2]} 
            rotation={[0, isOpen ? -Math.PI/1.5 : 0, 0]}
          >
            <mesh position={[0, 0, -d * 0.3]}>
              <boxGeometry args={[0.02, h * 0.8, d * 0.6]} />
              <meshStandardMaterial color="#cbd5e1" />
              {/* Kol */}
              <mesh position={[0.02, 0, -d * 0.2]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color="#94a3b8" /></mesh>
            </mesh>
          </group>
        </group>
      )
    } else if (type === 'motorcycle') {
      const bikeColor = displayColor;
      return (
        <group position={[0, h/2, 0]}>
          <group scale={[0.8, 0.8, 0.8]}>
            <mesh castShadow receiveShadow position={[0, -0.1, 0]}><boxGeometry args={[0.35, 0.25, 0.15]} /><meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.6} /></mesh>
            <mesh position={[0, -0.1, 0.08]}><cylinderGeometry args={[0.08, 0.08, 0.02]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#334155" metalness={0.9} /></mesh>
            <mesh position={[0, -0.1, -0.08]}><cylinderGeometry args={[0.08, 0.08, 0.02]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#334155" metalness={0.9} /></mesh>
            <mesh castShadow receiveShadow position={[0.1, 0.15, 0]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.35, 0.2, 0.18]} /><meshStandardMaterial color={bikeColor} roughness={0.3} metalness={0.4} /><Edges scale={1.02} color="#000000" /></mesh>
            <group position={[0.45, 0.25, 0]} rotation={[0, 0, -0.4]}>
              <mesh castShadow><boxGeometry args={[0.2, 0.2, 0.16]} /><meshStandardMaterial color={bikeColor} roughness={0.3} /></mesh>
              <mesh position={[0.1, -0.02, 0]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.02, 0.05, 0.12]} /><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} /></mesh>
              <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.01, 0.15, 0.1]} /><meshPhysicalMaterial color="#000" transmission={0.9} transparent opacity={0.6} /></mesh>
            </group>
            <mesh castShadow receiveShadow position={[-0.2, 0.15, 0]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.3, 0.08, 0.12]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
            <mesh castShadow receiveShadow position={[-0.45, 0.2, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.25, 0.06, 0.1]} /><meshStandardMaterial color={bikeColor} roughness={0.3} /></mesh>
            <mesh position={[-0.58, 0.23, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.02, 0.04, 0.08]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} /></mesh>
            <group position={[0.65, -0.25, 0]}>
              <mesh castShadow rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.18, 0.04, 16, 32]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
              <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
              <mesh rotation={[Math.PI/2, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
              <mesh rotation={[Math.PI/2, 0, Math.PI/2]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
            </group>
            <group position={[-0.6, -0.25, 0]}>
              <mesh castShadow rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.18, 0.05, 16, 32]} /><meshStandardMaterial color="#0f172a" roughness={0.9} /></mesh>
              <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.06, 16]} /><meshStandardMaterial color="#334155" metalness={0.8} /></mesh>
              <mesh rotation={[Math.PI/2, 0, 0]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
              <mesh rotation={[Math.PI/2, 0, Math.PI/2]}><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} /></mesh>
            </group>
            <group position={[0.6, 0.1, 0]} rotation={[0, 0, -0.3]}>
              <mesh castShadow position={[0, 0, 0.06]}><cylinderGeometry args={[0.015, 0.015, 0.6]} /><meshStandardMaterial color="#facc15" metalness={0.6} /></mesh>
              <mesh castShadow position={[0, 0, -0.06]}><cylinderGeometry args={[0.015, 0.015, 0.6]} /><meshStandardMaterial color="#facc15" metalness={0.6} /></mesh>
            </group>
            <group position={[-0.3, -0.15, 0]} rotation={[0, 0, -0.1]}>
              <mesh castShadow position={[-0.15, 0, 0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.35]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
              <mesh castShadow position={[-0.15, 0, -0.06]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.015, 0.015, 0.35]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
            </group>
            <mesh castShadow receiveShadow position={[-0.5, -0.1, 0.12]} rotation={[0, 0.1, 0.3]}><cylinderGeometry args={[0.04, 0.05, 0.45, 16]} rotation={[0, 0, Math.PI/2]} /><meshStandardMaterial color="#475569" metalness={0.8} /></mesh>
            <group position={[0.45, 0.4, 0]}>
              <mesh castShadow><cylinderGeometry args={[0.015, 0.015, 0.4, 12]} rotation={[Math.PI/2, 0, 0]} /><meshStandardMaterial color="#1e293b" /></mesh>
              <mesh position={[0, 0, 0.2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12]} /><meshStandardMaterial color="#000" /></mesh>
              <mesh position={[0, 0, -0.2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.12]} /><meshStandardMaterial color="#000" /></mesh>
            </group>
          </group>
        </group>
      )
    } else {
      return (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={displayColor} {...textureProps} transparent opacity={isDragging ? 0.8 : 1} />
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
      {modelUrl ? (
        <ModelErrorBoundary fallback={renderDetailedModel()}>
          <Suspense fallback={<mesh><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={displayColor} transparent opacity={0.5} /></mesh>}>
            <ModelLoader url={modelUrl} size={[w, h, d]} color={displayColor} />
            <Edges scale={1.001} color={edgeColor} />
          </Suspense>
        </ModelErrorBoundary>
      ) : renderDetailedModel()}

      {/* Seçim Kenarlıkları (renderDetailedModel içinde Edges yoksa garantiye al) */}
      {(isSelected || hovered || isDragging) && (
        <Edges scale={1.01} color={edgeColor} />
      )}

      {/* --- KILAVUZ ÇİZGİLERİ (Sürükleme Sırasında) --- */}
      {isDragging && (
        <group position={[0, -currentY + 0.02, 0]} rotation={[0, -currentRotY, 0]}>
          {/* Zemin Üzerindeki Crosshair (X ve Z Ekseni - Dünya Koordinatlarına göre) */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[20, 0.01, 0.01]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.01, 0.01, 40]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
          </mesh>
          
          {/* Merkez Noktası (Halka) */}
          <mesh rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.1, 0.12, 32]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
          </mesh>

          {/* Eşyadan Zemine İnen Dikey Lazer Çizgisi */}
          <mesh position={[0, currentY / 2, 0]}>
            <cylinderGeometry args={[0.005, 0.005, currentY]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  )
}
