"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor:[12, 41],
});

// Premium HQ Marker (Concentric rings + Core Glow)
const HQIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-12 h-12 group">
            <div class="absolute w-full h-full bg-blue-500/10 rounded-full animate-[pulse_3s_infinite]"></div>
            <div class="absolute w-2/3 h-2/3 bg-blue-500/20 rounded-full animate-[pulse_2s_infinite]"></div>
            <div class="absolute w-4 h-4 bg-blue-600 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10 transition-transform group-hover:scale-125"></div>
            <div class="absolute w-8 h-8 rounded-full border border-blue-400/30 animate-[spin_8s_linear_infinite] border-dashed"></div>
        </div>
    `,
    className: 'custom-marker-hq',
    iconSize: [48, 48],
    iconAnchor:[24, 24],
});

// Premium Region Marker (Clean Node)
const RegionIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-8 h-8 group">
            <div class="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg ring-1 ring-blue-100 transition-all group-hover:scale-150 group-hover:bg-blue-500"></div>
            <div class="absolute w-full h-full bg-blue-400/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
        </div>
    `,
    className: 'custom-marker-region',
    iconSize:[32, 32],
    iconAnchor: [16, 16],
});

const COORDINATES_MAP: Record<string, [number, number]> = {
    "1310 S Vista Ave Ste 28, Boise, Idaho – 83705":[43.5891, -116.2081],
    "120 Adelaide Street West, Suite 2500, M5H 1T1":[43.6499, -79.3842],
    "13 More London Riverside, London SE1 2RE":[51.5048, -0.0786],
    "BARTYCKA 22B M21A, 00-716 WARSZAWA":[52.2131, 21.0531],
    "Indus Net Technologies PTE Ltd., 60 Paya Lebar Road, #09-43 Paya Lebar Square – 409051":[1.3182, 103.8931],
    "4th Floor, SDF Building Saltlake Electronic Complex, Kolkata, West Bengal 700091":[22.5726, 88.4339],
    "4th Floor, Block-2b, ECOSPACE BUSINESS PARK, AA II, Newtown, Chakpachuria, West Bengal 700160":[22.5835, 88.4735],
};

const getCoordinates = (address: string): [number, number] | null => {
    for (const [key, coords] of Object.entries(COORDINATES_MAP)) {
        if (address.includes(key) || key.includes(address)) return coords;
    }
    const lower = address.toLowerCase();
    if (lower.includes('usa') || lower.includes('boise')) return[43.6150, -116.2023];
    if (lower.includes('canada')) return[43.6532, -79.3832];
    if (lower.includes('uk') || lower.includes('london')) return[51.5074, -0.1278];
    if (lower.includes('poland')) return[52.2297, 21.0122];
    if (lower.includes('singapore')) return[1.3521, 103.8198];
    if (lower.includes('india') || lower.includes('kolkata')) return[22.5726, 88.3639];
    return null;
};

interface LocationPoint {
    id: string;
    type: 'hq' | 'region';
    address: string;
    label: string;
    coords: [number, number];
}

const ChangeView = ({ positions, isComplete }: { positions: [number, number][], isComplete: boolean }) => {
    const map = useMap();
    useEffect(() => {
        if (isComplete && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            // Reverted padding to standard since the map is flat again
            map.flyToBounds(bounds, { 
                padding: [100, 100], 
                duration: 3, 
                easeLinearity: 0.1 
            });
        }
    }, [isComplete, positions, map]);
    return null;
};

export interface GlobalPresenceMapProps {
    data: {
        regions: Record<string, string>;
        headquarters: Record<string, string>;
    };
}

export const GlobalPresenceMap = ({ data }: GlobalPresenceMapProps) => {
    const [visiblePoints, setVisiblePoints] = useState<LocationPoint[]>([]);

    const allPoints = useMemo(() => {
        const points: LocationPoint[] =[];
        Object.entries(data.headquarters).forEach(([country, address], idx) => {
            const coords = getCoordinates(address);
            if (coords) points.push({ id: `hq-${idx}-${country}`, type: 'hq', address, label: country, coords });
        });
        Object.entries(data.regions).forEach(([country, address], idx) => {
            const coords = getCoordinates(address);
            if (coords) points.push({ id: `region-${idx}-${country}`, type: 'region', address, label: country, coords });
        });
        return points;
    }, [data]);

    const countriesList = useMemo(() => {
        return Array.from(new Set(allPoints.map(p => ({
            name: p.label.split(' ')[0],
            coords: p.coords
        })))).filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
    }, [allPoints]);

    useEffect(() => {
        setVisiblePoints([]);
        const timers: NodeJS.Timeout[] =[];
        allPoints.forEach((point, index) => {
            const timer = setTimeout(() => {
                setVisiblePoints(prev => [...prev, point]);
            }, index * 400);
            timers.push(timer);
        });
        return () => timers.forEach(t => clearTimeout(t));
    }, [allPoints]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                transition: { type: 'spring', stiffness: 350, damping: 25 }
            }}
            className="group relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-zinc-100/80 z-0"
        >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[60px] pointer-events-none z-[400]" />

            <div className="absolute top-4 left-4 md:top-10 md:left-10 z-[500] pointer-events-none max-w-[60%]">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="text-lg md:text-3xl font-black text-zinc-900 leading-tight tracking-tight uppercase">
                        Global <span className="text-blue-600">Network</span>
                    </h3>
                </motion.div>
            </div>

            <div className="absolute top-4 right-4 md:top-10 md:right-10 z-[500] flex flex-col items-end gap-1.5 md:flex-row md:gap-2">
                <div className="flex items-center gap-2 rounded-lg md:rounded-xl bg-white/90 px-2 py-1 md:px-3 md:py-1.5 backdrop-blur-xl ring-1 ring-zinc-100 shadow-sm">
                    <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest">HQ</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg md:rounded-xl bg-white/90 px-2 py-1 md:px-3 md:py-1.5 backdrop-blur-xl ring-1 ring-zinc-100 shadow-sm">
                    <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-blue-400"></div>
                    <span className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Regions</span>
                </div>
            </div>

            {/* Flat Map implementation (Tilt Removed) */}
            <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden bg-[#aadaff]">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%', background: 'transparent' }} 
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {visiblePoints.map((point) => (
                        <Marker
                            key={point.id}
                            position={point.coords}
                            icon={point.type === 'hq' ? HQIcon : RegionIcon}
                        >
                            <Popup className="flashcard-popup">
                                <div className="p-1 min-w-[180px]">
                                    <div className="text-[13px] md:text-[15px] font-bold text-zinc-900 mb-1 flex items-center justify-between">
                                        {point.label}
                                        {point.type === 'hq' && (
                                            <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 ring-1 ring-blue-100 px-1.5 py-0.5 rounded-md ml-2">HQ</span>
                                        )}
                                    </div>
                                    <div className="text-xs md:text-sm text-zinc-600 leading-relaxed font-medium">
                                        {point.address}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <ChangeView 
                        positions={allPoints.map(p => p.coords)} 
                        isComplete={visiblePoints.length === allPoints.length} 
                    />
                </MapContainer>
            </div>

            <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-10 z-[500]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 rounded-[1.5rem] md:rounded-[2rem] bg-white/90 p-4 md:px-8 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] ring-1 ring-white/60 group/status transition-all duration-500 hover:ring-blue-200">
                    
                    <div className="flex items-center justify-between md:justify-start gap-6 md:gap-16">
                        <div className="group/stat">
                            <div className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5 md:mb-1.5 transition-colors group-hover/stat:text-blue-500">Hubs</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-4xl font-black text-zinc-900 leading-none">
                                    {visiblePoints.length}
                                </span>
                                <span className="text-[8px] md:text-xs font-bold text-zinc-400">Nodes</span>
                            </div>
                        </div>

                        <div className="h-8 md:h-12 w-[1px] bg-zinc-200/80 rotate-12 transition-transform group-hover/status:rotate-0 duration-700"></div>

                        <div className="group/stat">
                            <div className="text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5 md:mb-1.5 transition-colors group-hover/stat:text-blue-500">Nations</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl md:text-4xl font-black text-zinc-900 leading-none">
                                    {countriesList.length}
                                </span>
                                <span className="text-[8px] md:text-xs font-bold text-zinc-400">Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 md:justify-end max-w-full md:max-w-[50%] p-1 md:p-0 overflow-x-auto no-scrollbar">
                        {countriesList.map((country) => (
                            <button
                                key={country.name}
                                onClick={(e) => {
                                    const map = (e.currentTarget.closest('.group') as any)?.querySelector('.leaflet-container')?._leaflet_map;
                                    if(map) map.flyTo(country.coords, 5, { duration: 1.5 });
                                }}
                                className="px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-zinc-100/80 text-[9px] md:text-[11px] font-black text-zinc-600 uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                            >
                                {country.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes drop {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .custom-marker {
                    animation: drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .flashcard-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    padding: 4px;
                }
                .flashcard-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }
                .flashcard-popup .leaflet-popup-content {
                    margin: 12px 14px;
                }
                
                .leaflet-container {
                    background: transparent !important;
                }
            `}</style>
        </motion.div>
    );
};