"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ShieldAlert, Activity, User, Info, ArrowRight, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const incRes = await fetch("/api/emergencies", { headers: { "x-mock-role": "OPERATOR" } });
      const incData = await incRes.json();
      
      const resRes = await fetch("/api/resources", { headers: { "x-mock-role": "OPERATOR" } });
      const resData = await resRes.json();

      if (incRes.ok && resRes.ok) {
        // Filter incidents to those needing attention
        const active = incData.filter((i: any) => ["SUBMITTED", "INCOMPLETE", "UNDER_REVIEW"].includes(i.status));
        setIncidents(active);
        setResources(resData);
      } else {
        setError(incData.error || resData.error || "Failed to load data");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (resourceId: string) => {
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/emergency/${selectedIncident.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-role": "OPERATOR"
        },
        body: JSON.stringify({ resourceId })
      });

      if (!res.ok) throw new Error("Assignment failed");

      alert(`Resource assigned to ${selectedIncident.id}`);
      setSelectedIncident(null);
      fetchData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading Command Centre...</div>;
  if (error) return <div className="min-h-screen text-white flex items-center justify-center">Error: {error}</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8 flex flex-col md:flex-row gap-6">
      {/* Left Sidebar - Incident List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <ShieldAlert className="text-blue-500" /> Command Centre
        </h1>
        
        <div className="space-y-3 overflow-y-auto pr-2 pb-20">
          {incidents.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No active incidents</p>
          ) : incidents.map((inc) => (
            <motion.div 
              key={inc.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedIncident(inc)}
              className={`glass-card p-4 cursor-pointer transition-colors ${selectedIncident?.id === inc.id ? 'border-blue-500/50 bg-blue-900/20' : 'hover:bg-slate-800/80'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm font-semibold text-blue-400">{inc.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${inc.status === 'INCOMPLETE' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {inc.status === 'INCOMPLETE' ? 'INCOMPLETE' : inc.priority?.level || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-slate-300 text-sm line-clamp-2">{inc.originalReport}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Content - Incident Details */}
      <div className="w-full md:w-2/3">
        <AnimatePresence mode="wait">
          {selectedIncident ? (
            <motion.div 
              key={selectedIncident.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card h-full p-6 sm:p-8 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Incident {selectedIncident.id}</h2>
                  <p className="text-slate-400 mt-1">Review AI analysis and confirm resource assignment.</p>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>

              {selectedIncident.status === 'INCOMPLETE' && (
                <div className="bg-orange-950/40 border border-orange-500/50 rounded-xl p-4 mb-6">
                  <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5" /> Manual Review Required
                  </h3>
                  <p className="text-slate-300 text-sm mb-2">The AI was unable to extract critical information from this report.</p>
                  <p className="text-slate-400 text-sm">Missing: {selectedIncident.missingInformation?.join(", ")}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* AI Extracted Facts */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" /> Extracted Facts
                  </h3>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-3">
                    <FactRow label="People" value={selectedIncident.facts?.people ?? "Unknown"} />
                    <FactRow label="Vulnerable" value={selectedIncident.facts?.vulnerablePeople ?? "Unknown"} highlight />
                    <FactRow label="Mobility Issue" value={selectedIncident.facts?.mobilityIssue ? "Yes" : "No/Unknown"} highlight />
                    <FactRow label="Water Intrusion" value={selectedIncident.facts?.waterIntrusion ? "Yes" : "No/Unknown"} />
                    <FactRow label="Primary Need" value={selectedIncident.facts?.need?.toUpperCase() || "Unknown"} />
                  </div>

                  {/* Priority Breakdown */}
                  {selectedIncident.priority && (
                    <>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-6">
                        <AlertCircle className="w-5 h-5 text-red-400" /> Priority Engine
                      </h3>
                      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-300">Score</span>
                          <span className="text-3xl font-bold text-red-400">{selectedIncident.priority.score}</span>
                        </div>
                        <ul className="space-y-2">
                          {selectedIncident.priority.reasons?.map((reason: string, i: number) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                {/* Resource Matching */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" /> Recommended Resources
                  </h3>
                  
                  {(!selectedIncident.recommendedResources || selectedIncident.recommendedResources.length === 0) && (
                    <p className="text-slate-500">No recommended resources found.</p>
                  )}

                  {resources.filter(r => selectedIncident.recommendedResources?.includes(r.id)).map((res) => (
                    <div key={res.id} className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5 relative overflow-hidden">
                      <h4 className="text-xl font-bold text-white mb-2">{res.name}</h4>
                      <p className="text-sm text-slate-400 mb-4">Capacity: {res.capacity} • Equip: {res.equipment?.join(", ")}</p>

                      <button 
                        onClick={() => handleAssign(res.id)}
                        disabled={isAssigning}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                      >
                        {isAssigning ? "Assigning..." : "Approve & Dispatch"}
                        {!isAssigning && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
              <p>Select an incident from the queue to review.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function FactRow({ label, value, highlight }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-red-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}
