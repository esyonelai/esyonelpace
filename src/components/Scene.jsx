import { Canvas } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera, Environment, Grid } from '@react-three/drei'
import VanModel from './VanModel'
import Furniture from './Furniture'
import { Suspense, useState } from 'react'

export default function Scene({ items, is3DView, vehicle, selectedItemId, onSelect, onUpdateItemPosition }) {
  const [isDraggingItem, setIsDraggingItem] = useState(false)

  return (
    <Canvas shadows className="w-full h-full">
      <color attach="background" args={['#1a1a1a']} />
      
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight 
        castShadow 
        position={[10, 15, 10]} 
        intensity={1.5} 
        color="#fdfbf7"
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
          
          <VanModel vehicle={vehicle} is3DView={is3DView} />
          
          {items.map(item => (
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
            />
          ))}
        </group>
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}
