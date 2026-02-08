
import React from 'react';
import { motion } from 'framer-motion';
import { EmailFormData } from '../../hooks/agentTypes';

interface EmailFormProps {
    data: EmailFormData;
}

export const EmailForm: React.FC<EmailFormProps> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900/80 dark:ring-white/10"
        >
            {/* Header / Title Bar */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Draft Email</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Review details before sending</p>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
                {/* User Details Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Name</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={data.user_name}>{data.user_name || '—'}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Email</label>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate" title={data.user_email}>{data.user_email || '—'}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />

                {/* Subject */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Subject</label>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-medium">{data.email_subject || '—'}</p>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />

                {/* Message Body */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Message</label>
                    <div className="rounded-lg bg-zinc-50/50 p-4 ring-1 ring-zinc-200/50 dark:bg-zinc-800/50 dark:ring-zinc-700/50">
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">
                            {data.email_body || 'No content provided.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / Status */}
            <div className="bg-zinc-50/50 px-6 py-3 border-t border-zinc-200/50 flex justify-between items-center dark:bg-zinc-800/30 dark:border-zinc-700/50">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Ready to send</span>
                </div>
                {/* 
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300">
                    Edit
                </button> 
                */}
            </div>
        </motion.div>
    );
};
