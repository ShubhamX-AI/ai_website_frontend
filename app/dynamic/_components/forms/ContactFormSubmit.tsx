
import React from 'react';
import { motion } from 'framer-motion';
import { ContactFormData } from '../../../hooks/agentTypes';

interface ContactFormSubmitProps {
    data: ContactFormData;
}

export const ContactFormSubmit: React.FC<ContactFormSubmitProps> = ({ data }) => {
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
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-white to-blue-50/50" />
                <div className="absolute -top-[50%] -left-[50%] w-[100%] h-[100%] bg-blue-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="flex flex-col items-center justify-center p-8 min-h-[380px] relative z-10 text-center">
                
                {/* Visual Icon */}
                <div className="relative mb-6">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    {/* Ring Pulse */}
                     <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                >
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        Details Recieved!
                    </h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[200px] mx-auto">
                        Thanks {data.user_name || 'there'}! We've got your info and will be in touch shortly.
                    </p>
                </motion.div>

                {/* Mini Receipt */}
                <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.6 }}
                     className="mt-8 w-full bg-white/50 border border-white rounded-2xl p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-2 text-left">
                        {data.user_email && (
                            <div className="flex items-center gap-2.5">
                                <span className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <span className="text-xs font-semibold text-zinc-700 truncate">{data.user_email}</span>
                            </div>
                        )}
                         {data.user_phone && (
                            <div className="flex items-center gap-2.5">
                                <span className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </span>
                                <span className="text-xs font-semibold text-zinc-700 truncate">{data.user_phone}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Success Indicator */}
                <div className="absolute bottom-6 flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse delay-75"></span>
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse delay-150"></span>
                </div>
            </div>
        </motion.div>
    );
};
