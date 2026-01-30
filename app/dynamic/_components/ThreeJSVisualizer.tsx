"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Environment } from '@react-three/drei';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';
import * as THREE from 'three';

interface ThreeJSVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
}

const AnimatedBlob = ({ agentTrack, userTrack }: ThreeJSVisualizerProps) => {
    const materialRef = useRef<any>(null);
    const agentVol = useTrackVolume(agentTrack as any);
    const userVol = useTrackVolume(userTrack as any);

    useFrame((state) => {
        if (!materialRef.current) return;

        // Clean volume values
        const aVol = Math.max(0, agentVol || 0);
        const uVol = Math.max(0, userVol || 0);

        // Total activity - Sensitive enough to pick up subtle speech
        const totalVol = Math.min(1, (aVol + uVol) * 2.0);

        // Animation Dynamics
        // For the "Core" look, we want symmetry. We distort less, but speed up.
        // Idle: smooth sphere. Active: energetic ripple.
        const targetDistort = 0.15 + (totalVol * 0.25); // Keeps it mostly spherical
        const targetSpeed = 3 + (totalVol * 6);

        // Interpolation
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);

        // Color Handling - Subtle Shift
        // Based on reference: White/Cyan center with Blue depth.
        // We modulate the emissive color slightly based on volume for "Glow"
        // But we rely mainly on the lights for the gradient.
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[1, 256, 256]} scale={1.8}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#ffffff"
                    emissive="#3b82f6"
                    emissiveIntensity={0.1}
                    roughness={0.4}
                    metalness={0.1}
                    distort={0.15}
                    speed={3}
                    bumpScale={0.01}
                />
            </Sphere>
        </Float>
    );
};

export const ThreeJSVisualizer: React.FC<ThreeJSVisualizerProps> = (props) => {
    return (
        <div className="h-full w-full">
            <Canvas camera={{ position: [0, 0, 8], fov: 35 }} gl={{ alpha: true, antialias: true }}>
                {/* Environment provides the "Gloss" and natural reflections */}
                <Environment preset="city" />

                {/* Lighting Setup for the "Core" Gradient Look */}
                {/* 1. Main soft white light from top-front */}
                <pointLight position={[5, 10, 10]} intensity={2.0} color="#ffffff" />

                {/* 2. Cyan/Blue fill from bottom-left */}
                <pointLight position={[-10, -10, 5]} intensity={4.0} color="#06b6d4" />

                {/* 3. Deep Blue rim light from right */}
                <pointLight position={[10, 0, -5]} intensity={3.0} color="#3b82f6" />

                {/* 4. Purple accent for depth */}
                <pointLight position={[0, -8, 2]} intensity={1.5} color="#8b5cf6" />

                <AnimatedBlob {...props} />
            </Canvas>
        </div>
    );
};
