
import React from 'react';
import { motion } from 'framer-motion';
import { ContactFormData } from '../../../hooks/agentTypes';

interface ContactFormProps {
    data: ContactFormData;
}

export const ContactForm: React.FC<ContactFormProps> = ({ data }) => {
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
                {/* Left Side: Visual / Paper Plane */}
                <div className="relative w-full md:w-[40%] bg-zinc-50/50 flex items-center justify-center p-8 overflow-hidden border-b md:border-b-0 md:border-r border-black/5">
                     <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ 
                                y: [0, -12, 0],
                                rotate: [0, -2, 2, 0]
                            }}
                            transition={{ 
                                duration: 5, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-full max-w-[240px] drop-shadow-xl"
                        >
                             <img 
                                src="https://intglobal.com/wp-content/uploads/2025/01/image-1226x1511-1.png" 
                                alt="Paper Airplane" 
                                className="w-full h-auto object-contain scale-110"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Form Fields */}
                <div className="w-full md:w-[60%] p-8 md:p-12 space-y-8 flex flex-col justify-center">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/80">Contact Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
                            Let's connect!
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 gap-5">
                            {/* Name Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wide">Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={data.user_name}
                                    placeholder="Your Name"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400 shadow-sm"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wide">Email <span className="text-red-500">*</span></label>
                                <input 
                                    type="email" 
                                    defaultValue={data.user_email}
                                    placeholder="name@company.com"
                                    className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400 shadow-sm"
                                />
                            </div>

                            {/* Phone and Country */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wide">Phone number <span className="text-red-500">*</span></label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select className="w-full appearance-none bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm">
                                            <option>India (भारत)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-zinc-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-[160px]">
                                        <input 
                                            type="text" 
                                            defaultValue={data.user_phone || "+91"}
                                            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Project Details */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wide">Message</label>
                                <textarea 
                                    rows={3}
                                    defaultValue={data.contact_details}
                                    placeholder="Tell us about your project..."
                                    className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400 resize-none shadow-sm"
                                />
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </motion.div>
    );
};
