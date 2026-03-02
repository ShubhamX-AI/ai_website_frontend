
import React from 'react';
import { motion } from 'framer-motion';
import { JobApplicationData } from '../../hooks/agentTypes';

interface JobApplicationSubmitProps {
    data: JobApplicationData;
}

export const JobApplicationSubmit: React.FC<JobApplicationSubmitProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60 p-1"
        >
            {/* Ambient background gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-white to-emerald-50/50" />
                <div className="absolute -top-[50%] -left-[50%] w-[100%] h-[100%] bg-emerald-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="flex flex-col items-center justify-center p-8 min-h-[400px] relative z-10 text-center">

                {/* Visual Icon */}
                <div className="relative mb-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </motion.div>
                    {/* Ring Pulse */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                >
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        Application Sent!
                    </h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[240px] mx-auto">
                        Your application for <span className="text-emerald-600 font-bold italic">{data.job_details || 'the position'}</span> has been received.
                    </p>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 px-6 py-2 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Recruitment Team Notified</span>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 text-[10px] text-zinc-400 font-medium"
                >
                    Closing this window in few seconds...
                </motion.p>
            </div>
        </motion.div>
    );
};
