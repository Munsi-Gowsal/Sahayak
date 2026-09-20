"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Camera, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const [report, setReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-mock-role": "CITIZEN"
        },
        body: JSON.stringify({
          originalReport: report,
          location: {
            latitude: 12.9716, // Mock location for demo
            longitude: 77.5946,
            address: "Bangalore"
          }
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit emergency");
      }

      router.push(`/status/${data.incidentId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 flex justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-2xl w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            Emergency Reporting
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Request Assistance</h1>
          <p className="text-slate-400">Describe your situation clearly. Our AI will extract the facts and dispatch the nearest help.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:p-8 relative"
        >
          <AnimatePresence>
            {isSubmitting && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center"
              >
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-white">Analyzing report...</p>
                <p className="text-slate-400 text-sm mt-1">Extracting facts with Amazon Bedrock</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">What is the emergency?</label>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="E.g., My mother is trapped inside our house. Water has entered the ground floor. There are 4 people here and she cannot walk."
                className="glass-input min-h-[160px] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" className="glass-input flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">Share Location</span>
              </button>
              <button type="button" className="glass-input flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-300">Add Photo Evidence</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!report.trim() || isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              Submit Emergency Request
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
