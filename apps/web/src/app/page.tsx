"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldAlert, Activity, Users, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 overflow-hidden relative">
      
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-3xl"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="mx-auto w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <ShieldAlert className="w-10 h-10 text-blue-400" />
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
          Sahayak
        </h1>
        <p className="text-xl sm:text-2xl text-slate-300 mb-12 font-light leading-relaxed">
          AI-assisted emergency decision and resource allocation platform.
          <br className="hidden sm:block" /> Fast, deterministic, and life-saving.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/report" className="w-full sm:w-auto">
            <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group text-lg">
              Report Emergency
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-lg">
              Command Centre
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24">
        <FeatureCard 
          icon={<Activity className="w-6 h-6 text-blue-400" />}
          title="Deterministic Priority"
          description="Rules-based scoring engine evaluating critical factors instantly."
          delay={0.4}
        />
        <FeatureCard 
          icon={<ShieldAlert className="w-6 h-6 text-red-400" />}
          title="AI Fact Extraction"
          description="Powered by Amazon Bedrock to structure messy citizen reports."
          delay={0.5}
        />
        <FeatureCard 
          icon={<Users className="w-6 h-6 text-emerald-400" />}
          title="Resource Matching"
          description="Automatically connects the right equipment to the right incident."
          delay={0.6}
        />
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 flex flex-col items-start text-left hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
