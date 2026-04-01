'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    
    const circleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            context.beginPath();
            context.arc(32, 32, 30, 0, Math.PI * 2);
            context.fillStyle = 'white';
            context.fill();
        }
        return new THREE.CanvasTexture(canvas);
    },[]);

    const particleCount = 3000;
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);
        
        const palette = [
            new THREE.Color('#f43f5e'), // rose-500
            new THREE.Color('#f59e0b'), // amber-500
            new THREE.Color('#6366f1'), // indigo-500
            new THREE.Color('#8b5cf6'), // violet-500
            new THREE.Color('#06b6d4'), // cyan-500
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Pattern: Sphere/Vortex like the image
            const radius = 8 + Math.random() * 12;
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);

            pos[i3] = radius * Math.sin(theta) * Math.cos(phi);
            pos[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            pos[i3 + 2] = radius * Math.cos(theta);

            // Assign random color from palette
            const color = palette[Math.floor(Math.random() * palette.length)];
            col[i3] = color.r;
            col[i3 + 1] = color.g;
            col[i3 + 2] = color.b;
        }
        return { positions: pos, colors: col };
    },[]);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.05;
            ref.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                map={circleTexture}
                alphaTest={0.01} 
                size={0.18}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export const ThreeBackground: React.FC = () => {
    return (
        // FIX 4: Removed `bg-white` from here so your radial gradients from DynamicPage show through!
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
                <ambientLight intensity={1} />
                
                {/* Fog color changed to match background for seamless blending */}
                {/* Pushed fog further back and made it less aggressive */}
                <fog attach="fog" args={['#FAFAFA', 5, 45]} /> 
                
                <ParticleField />
            </Canvas>
        </div>
    );
};