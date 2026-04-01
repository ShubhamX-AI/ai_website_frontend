
import React from 'react';
import { motion } from 'framer-motion';
import { MeetingFormData } from '../../../hooks/agentTypes';

interface MeetingFormProps {
    data: MeetingFormData;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ data }) => {
    // Format date string for better display
    const formattedDate = new Date(data.start_time).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = new Date(data.start_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60"
        >
            {/* Ambient background gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row min-h-[500px]">
                {/* Left Side: Visual / Calendar Icon */}
                <div className="relative w-full md:w-[40%] bg-zinc-50/50 flex items-center justify-center p-8 overflow-hidden border-b md:border-b-0 md:border-r border-black/5">
                     <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, -1, 1, 0]
                            }}
                            transition={{ 
                                duration: 6, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-full max-w-[200px] drop-shadow-2xl"
                        >
                             <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                             </div>
                        </motion.div>
                        <div className="mt-8 text-center">
                            <h3 className="text-xl font-bold text-zinc-900">Meeting Preview</h3>
                            <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest font-bold">Review Details</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Meeting Details */}
                <div className="w-full md:w-[60%] p-8 md:p-12 space-y-8 flex flex-col justify-center">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/80">Calendar Invite</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
                            {data.subject || 'Untitled Meeting'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Time and Duration */}
                        <div className="flex gap-4 items-start">
                            <div className="p-3 rounded-2xl bg-zinc-100/80 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-900">{formattedDate}</p>
                                <p className="text-sm text-zinc-500">{formattedTime} • {data.duration_hours} hour{data.duration_hours !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex gap-4 items-start">
                            <div className="p-3 rounded-2xl bg-zinc-100/80 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Location</p>
                                <p className="text-sm font-semibold text-zinc-800">{data.location}</p>
                            </div>
                        </div>

                        {/* Recipient */}
                        <div className="flex gap-4 items-start">
                            <div className="p-3 rounded-2xl bg-zinc-100/80 text-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Recipient</p>
                                <p className="text-sm font-semibold text-zinc-800">{data.recipient_email}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {data.description && (
                             <div className="pt-4 border-t border-zinc-100">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">Description</p>
                                <p className="text-sm text-zinc-600 leading-relaxed italic">
                                    "{data.description}"
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <div className="flex items-center gap-2 text-blue-600/60 font-medium text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Awaiting your confirmation to send...
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
