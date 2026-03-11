"use client";

import React from "react";
import { LayoutDashboard, ShoppingCart, Package, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Daily Revenue", value: "Rs. 24,500", icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Total Orders", value: "142", icon: ShoppingCart, color: "bg-sky-500" },
    { label: "New Customers", value: "28", icon: Package, color: "bg-amber-500" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="text-sm text-slate-500 font-medium">Last updated: Mar 12, 2026</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">U{i}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">New order placed #100{i*10}</p>
                  <p className="text-xs text-slate-400 font-medium tracking-tight">Processed via POS Terminal</p>
                </div>
              </div>
              <div className="text-sm font-black text-slate-900">+ Rs. 1,200.00</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
