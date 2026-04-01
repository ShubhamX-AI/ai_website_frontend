"use client";

import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const StartIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const EndIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor:[12, 41],
    popupAnchor: [1, -34],
    shadowSize:[41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


const decodePolyline = (str: string) => {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates =[];
    let shift = 0;
    let result = 0;
    let byte = null;
    let latitude_change, longitude_change;

    while (index < str.length) {
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / 1e5, lng / 1e5] as [number, number]);
    }

    return coordinates;
};

const ChangeView = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
};



interface MapDisplayProps {
    polyline: string;
    origin?: string;
    destination?: string;
    travelMode?: 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT' | 'TWO_WHEELER';
    distance?: string;
    duration?: string;
    mode_label?: string;
    destination_image_url?: string;
}

const TravelModeIcon = ({ mode }: { mode?: string }) => {
    const normalized = mode?.toUpperCase();
    switch (normalized) {
        case 'WALK':
        case 'WALKING':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="12" cy="5" r="1.5" /><path d="M9 20l2-5m0 0l1-3m-1 3h4l2 5M13 12l-2-2-3 4" />
                </svg>
            );
        case 'BICYCLE':
        case 'BICYCLING':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
                </svg>
            );
        case 'TRANSIT':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="4" y="3" width="16" height="16" rx="2" /><path d="M4 11h16M12 3v8M8 19l-2 3M16 19l2 3" /><circle cx="8" cy="15" r="1" /><circle cx="16" cy="15" r="1" />
                </svg>
            );
        case 'TWO_WHEELER':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <circle cx="5" cy="17" r="3" /><circle cx="19" cy="17" r="3" /><path d="M9 17h6M5 14l4-7h4l2 3h4" />
                </svg>
            );
        case 'DRIVE':
        case 'DRIVING':
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" />
                </svg>
            );
    }
}

export const MapDisplay = React.memo(({ polyline, origin, destination, travelMode, distance, duration, mode_label, destination_image_url }: MapDisplayProps) => {
    const positions = useMemo(() => decodePolyline(polyline),[polyline]);
    
    const bounds = useMemo(() => {
        if (positions.length === 0) return null;
        return L.latLngBounds(positions);
    }, [positions]);

    if (positions.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 ring-1 ring-black/5">
                No route data available
            </div>
        );
    }

    const startPoint = positions[0];
    const endPoint = positions[positions.length - 1];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="group relative h-[400px] w-full overflow-hidden rounded-[32px] bg-white/40 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-2xl transition-all hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] md:h-[500px]"
        >
            <div className="absolute inset-0 z-10 pointer-events-none rounded-[30px] border-[6px] border-white/50 shadow-inner"></div>
            
            <MapContainer 
                center={startPoint} 
                zoom={13} 
                style={{ height: '100%', width: '100%', borderRadius: '26px' }}
                zoomControl={false}
                scrollWheelZoom={false}
            >
                {/* Replaced the gray, muted CARTO map with the vibrant OpenStreetMap standard tiles */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Thickened and fully opaqued the line so it stands out over the new colorful map */}
                <Polyline 
                    positions={positions} 
                    pathOptions={{ 
                        color: '#2563eb', 
                        weight: 6, 
                        opacity: 1,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }} 
                />

                <Marker position={startPoint} icon={StartIcon}>
                    <Popup>
                        <div className="text-xs font-semibold">{origin || "Current Location"}</div>
                    </Popup>
                </Marker>

                <Marker position={endPoint} icon={EndIcon}>
                    <Popup>
                        <div className="text-xs font-semibold">{destination || "Destination"}</div>
                    </Popup>
                </Marker>

                {bounds && <ChangeView bounds={bounds} />}
            </MapContainer>

            {/* Premium Overlay Elements */}
            <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
                    <TravelModeIcon mode={travelMode} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{mode_label || travelMode || 'DRIVE'}</span>
                </div>
                {(distance || duration) && (
                    <div className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-1.5 text-zinc-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                        {distance && (
                            <div className="flex flex-col">
                                <span className="text-[8px] font-medium text-zinc-500 uppercase">Distance</span>
                                <span className="text-xs font-bold">{distance}</span>
                            </div>
                        )}
                        {distance && duration && <div className="h-4 w-px bg-zinc-200"></div>}
                        {duration && (
                            <div className="flex flex-col">
                                <span className="text-[8px] font-medium text-zinc-500 uppercase">Time</span>
                                <span className="text-xs font-bold text-blue-600">{duration}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
                    {/* Destination thumbnail */}
                    {destination_image_url && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5">
                            <img src={destination_image_url} alt={destination || 'Destination'} className="h-full w-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                                <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white"></div>
                                <div className="h-4 w-0.5 border-l border-dashed border-zinc-300"></div>
                                <div className="h-2.5 w-2.5 rounded-sm bg-red-500"></div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Your Location</span>
                                    <span className="text-xs font-semibold text-zinc-900 truncate max-w-[150px]">{origin || "Current Position"}</span>
                                </div>
                                <div className="h-px bg-zinc-100"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Destination</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-semibold text-zinc-900 truncate max-w-[200px]">{destination || "Calculating..."}</span>
                                        {mode_label && <span className="text-[10px] text-zinc-400">{mode_label}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

MapDisplay.displayName = 'MapDisplay';