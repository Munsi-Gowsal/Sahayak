"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock, Truck, ShieldCheck, MapPin, Info } from "lucide-react";

type CitizenStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESPONDER_ASSIGNED' | 'HELP_ON_THE_WAY' | 'HELP_IN_PROGRESS' | 'RESOLVED';

const STATUS_STEPS: { id: CitizenStatus; label: string; icon: any; description: string }[] = [
  { id: 'SUBMITTED', label: 'Submitted', icon: CheckCircle2, description: 'Your request has been logged.' },
  { id: 'UNDER_REVIEW', label: 'Under Review', icon: Clock, description: 'Command centre is reviewing AI extraction.' },
  { id: 'RESPONDER_ASSIGNED', label: 'Assigned', icon: ShieldCheck, description: 'A responder has been assigned.' },
  { id: 'HELP_ON_THE_WAY', label: 'On The Way', icon: Truck, description: 'Help is travelling to your location.' },
  { id: 'HELP_IN_PROGRESS', label: 'In Progress', icon: Info, description: 'Responder has arrived.' },
  { id: 'RESOLVED', label: 'Resolved', icon: CheckCircle2, description: 'The emergency is resolved.' },
];

export default function StatusPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [incident, setIncident] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/emergency/${id}`, {
          headers: { "x-mock-role": "CITIZEN" }
        });
        const data = await res.json();
        
        if (res.ok) {
          setIncident(data);
          const statusIndex = STATUS_STEPS.findIndex(s => s.id === data.status);
          if (statusIndex !== -1) setCurrentStatusIndex(statusIndex);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [id]);

  if (error) {
    return <div className="min-h-screen text-white flex items-center justify-center">Error: {error}</div>;
  }
  
  if (!incident) {
    return <div className="min-h-screen text-white flex items-center justify-center">Loading incident status...</div>;
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 flex justify-center relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-2xl w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Request Status</h1>
            <p className="text-slate-400">Tracking Request ID: <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">{id}</span></p>
          </div>
          
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">Priority Level</span>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-md border border-red-500/30">
              CRITICAL
            </span>
          </div>
        </motion.div>

        <div className="glass-card p-6 sm:p-8">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-800 rounded-full" />
            
            {/* Animated progress line */}
            <motion.div 
              className="absolute left-6 top-6 w-0.5 bg-blue-500 rounded-full origin-top"
              initial={{ height: 0 }}
              animate={{ 
                height: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />

            <div className="space-y-8 relative">
              {STATUS_STEPS.map((step, index) => {
                const isActive = index === currentStatusIndex;
                const isPast = index < currentStatusIndex;
                const Icon = step.icon;

                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-6 relative ${!isPast && !isActive ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                      isActive ? 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] text-white' : 
                      isPast ? 'bg-emerald-500 text-white' : 
                      'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="pt-2">
                      <h3 className={`text-lg font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {step.label}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {step.description}
                      </p>
                      
                      {isActive && step.id === 'HELP_ON_THE_WAY' && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-white/5"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                              <Truck className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Rescue Team A</p>
                              <p className="text-xs text-slate-400">ETA: 5 minutes</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            Live location sharing enabled
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
