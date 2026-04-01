"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { NearbyOfficesData } from '../../../hooks/agentTypes';
import { SmartIcon } from '../shared/SmartIcon';

interface NearbyOfficesProps {
    data: NearbyOfficesData;
}

export const NearbyOffices: React.FC<NearbyOfficesProps> = ({ data }) => {
    const { offices } = data;

    if (!offices || offices.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 260,
                damping: 20
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col items-center gap-6 px-4 py-8 md:px-8"
        >
            <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-2 text-center"
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm">
                    <SmartIcon iconRef="map-pin" className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 md:text-3xl uppercase">
                    Nearby <span className="text-blue-600">Offices</span>
                </h2>
                <p className="max-w-md text-sm font-medium text-zinc-500">
                    Find our closest locations and visit us for more details.
                </p>
            </motion.div>

            <div className={`grid w-full gap-6 ${offices.length === 1 ? 'max-w-xl grid-cols-1' :
                offices.length === 2 ? 'max-w-4xl grid-cols-1 md:grid-cols-2' :
                    'max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                {offices.map((office) => (
                    <motion.div
                        key={office.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white/95 p-4 backdrop-blur-2xl transition-all shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-white/60 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:ring-blue-100"
                    >
                        {/* Office Image */}
                        {office.image_url ? (
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-zinc-100">
                                <img
                                    src={office.image_url}
                                    alt={office.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        ) : (
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
                                <SmartIcon iconRef="building-2" className="h-12 w-12 text-zinc-300" />
                            </div>
                        )}

                        {/* Office Info */}
                        <div className="flex flex-col gap-3 p-4">
                            <div className="flex items-start justify-between">
                                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                                    {office.name}
                                </h3>
                                <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
                                    Office
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 ring-1 ring-zinc-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                                    <SmartIcon iconRef="map-pin" className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-zinc-600">
                                    {office.address}
                                </p>
                            </div>

                            {office.map_url && (
                                <a
                                    href={office.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 flex items-center gap-2 self-start rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 ring-1 ring-blue-100 transition-all hover:bg-blue-100 hover:shadow-md"
                                >
                                    <SmartIcon iconRef="external-link" className="h-4 w-4" />
                                    View on Map
                                </a>
                            )}
                        </div>

                        {/* Subtle decorative glow */}
                        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl transition-opacity group-hover:opacity-100" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
