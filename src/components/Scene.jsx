import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera, Environment, Grid } from '@react-three/drei'
import VanModel from './VanModel'
import TrailerModel from './TrailerModel'
import Furniture from './Furniture'
import { Suspense, useState } from 'react'

export default function Scene({ items, is3DView, vehicle, selectedItemId, onSelect, onUpdateItemPosition, wallTexture, floorTexture, isNightMode, caravanType, trailerClass, trailerShape }) {
  const [isDraggingItem, setIsDraggingItem] = useState(false)

  const isAwningOpen = items.some(item => item.type === 'awning' && item.isOpen);

  return (
    <Canvas shadows gl={{ preserveDrawingBuffer: true }} className="w-full h-full">
      <color attach="background" args={[isNightMode ? '#020617' : '#1a1a1a']} />
      
      {isNightMode && <fog attach="fog" args={['#020617', 5, 30]} />}

      <ambientLight intensity={isNightMode ? 0.05 : 0.6} color={isNightMode ? "#1e293b" : "#ffffff"} />
      <directionalLight 
        castShadow 
        position={[10, 15, 10]} 
        intensity={isNightMode ? 0.2 : 1.5} 
        color={isNightMode ? "#334155" : "#fdfbf7"}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
      </directionalLight>
      
      <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#dbeafe" />

      {/* Camera Logic */}
      {is3DView ? (
        <>
          <PerspectiveCamera makeDefault position={[6, 5, 8]} fov={45} />
          <OrbitControls 
            makeDefault 
            enabled={!isDraggingItem}
            maxDistance={40}
            minDistance={2}
            enableDamping
            dampingFactor={0.05}
          />
        </>
      ) : (
        <>
          <OrthographicCamera makeDefault position={[0, 15, 0]} zoom={60} />
          <OrbitControls 
            makeDefault 
            enabled={!isDraggingItem}
            enableRotate={false} 
            enableZoom={true} 
            enablePan={true} 
            enableDamping
            dampingFactor={0.05}
          />
        </>
      )}

      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
          <Grid 
            infiniteGrid 
            fadeDistance={40} 
            sectionColor="#444" 
            cellColor="#222" 
            sectionSize={1}
            cellSize={0.2}
            position={[0, -0.01, 0]} 
          />
          
          {caravanType === 'cekme' ? (
            <TrailerModel 
              vehicle={vehicle} 
              trailerClass={trailerClass} 
              trailerShape={trailerShape} 
              wallTexture={wallTexture} 
              floorTexture={floorTexture} 
            />
          ) : (
            <VanModel vehicle={vehicle} is3DView={is3DView} wallTexture={wallTexture} floorTexture={floorTexture} />
          )}
          
          {items.map(item => {
            if (item.linkedToAwning && !isAwningOpen) return null;
            
            return (
              <Furniture 
                key={item.id} 
                item={item}
                vehicle={vehicle}
                isSelected={item.id === selectedItemId}
                onSelect={() => onSelect(item.id)}
                onUpdatePosition={(pos) => onUpdateItemPosition(item.id, pos)} 
                is2D={!is3DView}
                onDragStart={() => setIsDraggingItem(true)}
                onDragEnd={() => setIsDraggingItem(false)}
                isNightMode={isNightMode}
              />
            )
          })}
        </group>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
