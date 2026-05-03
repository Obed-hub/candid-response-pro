import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SEO } from "@/components/SEO";
import { Users, Heart, Target, ShieldCheck } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">
      <SEO 
        title="About Us | UserPOV"
        description="We're on a mission to help businesses listen better through anonymous, real-time feedback."
      />
      <SiteHeader />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Our Mission: Make Feedback Safe
          </h1>
          <p className="text-xl text-slate-400">
            We believe that the best insights come from honesty. But honesty is hard when it's not anonymous.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
            <p>
              UserPOV was born out of a simple observation: Most customer feedback is filtered. People are polite to your face, but honest behind your back.
            </p>
            <p>
              By the time an unhappy customer leaves a negative review on Google or TripAdvisor, it's often too late to save the relationship.
            </p>
            <p className="font-semibold text-white">
              We built UserPOV to bridge that gap. 
            </p>
            <p>
              Our platform gives customers a private, anonymous channel to share their true thoughts in real-time—before they leave your store, restaurant, or website.
            </p>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-amber-500/20 blur-[100px] -z-10" />
             <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl">
               <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                    <Users className="text-amber-500 mb-4" size={32} />
                    <h3 className="font-bold mb-1">Human Centered</h3>
                    <p className="text-sm text-slate-500">Built for real conversations.</p>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                    <ShieldCheck className="text-amber-500 mb-4" size={32} />
                    <h3 className="font-bold mb-1">Privacy First</h3>
                    <p className="text-sm text-slate-500">Anonymous by default.</p>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                    <Target className="text-amber-500 mb-4" size={32} />
                    <h3 className="font-bold mb-1">Action Oriented</h3>
                    <p className="text-sm text-slate-500">Insights you can use.</p>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                    <Heart className="text-amber-500 mb-4" size={32} />
                    <h3 className="font-bold mb-1">Customer Love</h3>
                    <p className="text-sm text-slate-500">Reducing churn daily.</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold mb-8">Join 1,000+ businesses listening better.</h2>
          <button className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-600 transition-colors">
            Start Your Journey
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default AboutUs;
