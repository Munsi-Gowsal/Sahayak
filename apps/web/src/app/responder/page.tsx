"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

export default function ResponderPage() {
  const [incident, setIncident] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("ASSIGNED");
  const [updating, setUpdating] = useState(false);

  const progress: any = {
    ASSIGNED: 0,
    ACCEPTED: 20,
    TRAVELLING: 40,
    ARRIVED: 60,
    HELP_IN_PROGRESS: 80,
    RESOLVED: 100,
  };

  const fetchIncident = async () => {
    try {
      // In a real app, this would fetch incidents assigned to THIS specific responder.
      // For MVP, we fetch all emergencies and find one that is RESPONDER_ASSIGNED.
      const res = await fetch("/api/emergencies", { headers: { "x-mock-role": "RESPONDER" } });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch assignments");

      // Find first incident assigned but not resolved
      const assigned = data.find((i: any) => 
        ["RESPONDER_ASSIGNED", "HELP_ON_THE_WAY", "HELP_IN_PROGRESS"].includes(i.status)
      );

      if (assigned) {
        setIncident(assigned);
        // Extract the responder status from the timeline (most recent responder event)
        const responderEvents = assigned.timeline?.filter((e: any) => e.actorRole === "RESPONDER") || [];
        if (responderEvents.length > 0) {
          const latestEvent = responderEvents[responderEvents.length - 1];
          setStatus(latestEvent.metadata?.responderStatus || "ASSIGNED");
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
    const interval = setInterval(fetchIncident, 5000);
    return () => clearInterval(interval);
  }, []);

  const advanceStatus = async (nextStatus: string) => {
    if (!incident) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/emergency/${incident.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-mock-role": "RESPONDER"
        },
        body: JSON.stringify({ status: nextStatus, actorId: "RESPONDER_1" })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setStatus(nextStatus);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleNextAction = () => {
    switch(status) {
      case "ASSIGNED": return advanceStatus("ACCEPTED");
      case "ACCEPTED": return advanceStatus("TRAVELLING");
      case "TRAVELLING": return advanceStatus("ARRIVED");
      case "ARRIVED": return advanceStatus("HELP_IN_PROGRESS");
      case "HELP_IN_PROGRESS": return advanceStatus("RESOLVED");
    }
  };

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Assignments...</div>;
  if (error) return <div className="min-h-screen text-white flex items-center justify-center">Error: {error}</div>;

  if (!incident) {
    return (
      <main className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="text-center text-slate-500">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold">No Active Assignments</h2>
          <p>You are currently marked as AVAILABLE.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex justify-center">
      <div className="w-full max-w-md bg-slate-900 border-x border-white/5 min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="bg-slate-800 p-4 sticky top-0 z-20 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-400" /> Rescue Team A
            </h1>
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-4 relative z-10">
          
          {/* Top critical card */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`bg-gradient-to-br border rounded-2xl p-4 shadow-lg ${
              incident.priority?.level === 'CRITICAL' ? 'from-red-900/40 to-slate-900 border-red-500/30' : 'from-blue-900/40 to-slate-900 border-blue-500/30'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                incident.priority?.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>{incident.priority?.level || 'INCIDENT'}</span>
              <span className="font-mono text-sm text-slate-300">{incident.id}</span>
            </div>
            <p className="text-white font-medium mb-3">{incident.originalReport}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-950/50 p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-400" />
              {incident.facts?.location?.address || "Unknown Location"}
            </div>
          </motion.div>

          {/* Action Area */}
          <div className="flex-1 flex flex-col justify-end pb-8">
            <AnimatePresence mode="wait">
              {status === "ASSIGNED" && (
                <motion.div key="assign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <button onClick={handleNextAction} disabled={updating} className="btn-primary w-full h-16 text-xl">Accept Assignment</button>
                  <button className="btn-secondary w-full h-14">Decline</button>
                </motion.div>
              )}

              {status === "ACCEPTED" && (
                <motion.div key="accept" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <button onClick={handleNextAction} disabled={updating} className="btn-primary w-full h-16 text-xl flex justify-center items-center gap-2">
                    <Navigation className="w-5 h-5" /> Start Navigation
                  </button>
                </motion.div>
              )}

              {status === "TRAVELLING" && (
                <motion.div key="travel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center mb-4">
                    <Navigation className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-blue-100 font-medium">Navigating to scene...</p>
                  </div>
                  <button onClick={handleNextAction} disabled={updating} className="btn-primary w-full h-16 text-xl">Mark as Arrived</button>
                </motion.div>
              )}

              {status === "ARRIVED" && (
                <motion.div key="arrive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <button onClick={handleNextAction} disabled={updating} className="btn-primary w-full h-16 text-xl bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                    Begin Assistance
                  </button>
                </motion.div>
              )}

              {status === "HELP_IN_PROGRESS" && (
                <motion.div key="help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 text-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-orange-100 font-medium">Assistance in progress...</p>
                  </div>
                  <button onClick={handleNextAction} disabled={updating} className="btn-primary w-full h-16 text-xl bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-5 h-5 inline mr-2" /> Mark Resolved
                  </button>
                </motion.div>
              )}

              {status === "RESOLVED" && (
                <motion.div key="resolve" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-900/30 border border-emerald-500/50 rounded-2xl p-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Incident Resolved</h2>
                  <p className="text-slate-400 mb-6">Great job. You are now marked as AVAILABLE.</p>
                  <button onClick={() => { setIncident(null); setStatus("ASSIGNED"); }} className="btn-secondary w-full">Return to Dashboard</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="h-1.5 w-full bg-slate-800 mt-auto relative z-20">
          <motion.div 
            className="h-full bg-blue-500"
            animate={{ width: `${progress[status] || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </main>
  );
}
