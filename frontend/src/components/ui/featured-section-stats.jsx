import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Smartphone, Clock, Layers, TrendingDown, ArrowDown } from "lucide-react";

export default function FeaturedSectionStats() {
  const data = [
    { month: "Jan", hours: 12 },
    { month: "Feb", hours: 20 },
    { month: "Mar", hours: 32 },
    { month: "Apr", hours: 45 },
    { month: "May", hours: 60 },
    { month: "Jun", hours: 75 },
    { month: "Jul", hours: 88 },
  ];

  const problemStats = [
    {
      stat: "Multi-Broker",
      title: "Fragmented Logins",
      desc: "Accounts retail investors juggle daily.",
      icon: <Smartphone className="w-5 h-5 text-stripe-blue" />,
      color: "bg-blue-500/10",
    },
    {
      stat: "4.5 Hrs",
      title: "Wasted Weekly",
      desc: "Lost cross-checking returns & spreadsheets.",
      icon: <Clock className="w-5 h-5 text-stripe-purple" />,
      color: "bg-purple-500/10",
    },
    {
      stat: "82%",
      title: "Hidden Overlap",
      desc: "Mutual funds holding identical stocks.",
      icon: <Layers className="w-5 h-5 text-stripe-cyan" />,
      color: "bg-cyan-500/10",
    },
    {
      stat: "90%",
      title: "Market Noise",
      desc: "Sensational calls causing panic trades.",
      icon: <TrendingDown className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-500/10",
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-card-light dark:bg-card-dark border border-slate-200 dark:border-slate-700 shadow-xl">
          <p className="text-xs font-bold text-stripe-blue dark:text-stripe-cyan uppercase tracking-wider">{item.month}</p>
          <p className="text-base font-black text-heading-light dark:text-heading-dark">{item.hours} hrs / month</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-24 bg-background-light dark:bg-background-dark relative overflow-hidden border-t border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header - Blended to match rest of website typography & animated gradient */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <h3 className="text-4xl md:text-6xl font-black text-heading-light dark:text-heading-dark leading-tight">
            Juggling brokers <br />
            <span className="cool-gradient-text">for one portfolio?</span>
          </h3>
          <p className="text-lg md:text-xl text-stripe-slate dark:text-slate-400 mt-6 leading-relaxed font-medium">
            Scattered brokers, broken spreadsheets, and endless noise. Investing shouldn't feel like an unpaid data entry job.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {problemStats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-card-light dark:hover:bg-card-dark hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-black text-heading-light dark:text-heading-dark">{item.stat}</span>
                <div className={`p-3 rounded-2xl ${item.color}`}>{item.icon}</div>
              </div>
              <h4 className="text-base font-bold text-heading-light dark:text-heading-dark mb-1">{item.title}</h4>
              <p className="text-sm text-stripe-slate dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="p-8 md:p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <span className="text-base font-bold text-heading-light dark:text-heading-dark">
              Monthly hours lost to manual portfolio tracking
            </span>
            <span className="text-xs font-bold text-stripe-blue dark:text-stripe-cyan uppercase tracking-wider">
              Portfolio Complexity Curve
            </span>
          </div>

          <div className="w-full h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#635bff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#635bff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Seamless Solution Bridge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-16 flex flex-col items-center justify-center text-center gap-2"
        >
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold text-stripe-slate dark:text-slate-300 hover:border-stripe-blue/40 transition-colors">
            <span className="w-2 h-2 rounded-full bg-stripe-blue animate-pulse" />
            <span className="text-heading-light dark:text-heading-dark">Here's our solution</span>
            <ArrowDown className="w-4 h-4 text-stripe-blue dark:text-stripe-cyan animate-bounce ml-0.5" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
