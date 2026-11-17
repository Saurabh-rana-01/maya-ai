import React from 'react';
import { Icon } from './Icons.jsx';

export const StatCard = ({
  title,
  count,
  subtitle,
  icon,
  colorScheme = 'purple',
  isActive = false,
  onClick
}) => {
  const schemeStyles = {
    purple: {
      activeBorder: 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/40',
      badge: 'bg-brand-100 text-brand-800',
      iconBg: 'bg-brand-50 text-brand-600',
      countText: 'text-brand-900'
    },
    amber: {
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-800',
      iconBg: 'bg-amber-50 text-amber-600',
      countText: 'text-amber-900'
    },
    emerald: {
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-50 text-emerald-600',
      countText: 'text-emerald-900'
    },
    blue: {
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-50 text-blue-600',
      countText: 'text-blue-900'
    },
    rose: {
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40',
      badge: 'bg-rose-100 text-rose-800',
      iconBg: 'bg-rose-50 text-rose-600',
      countText: 'text-rose-900'
    },
    slate: {
      activeBorder: 'border-slate-500 ring-2 ring-slate-500/20 bg-slate-50',
      badge: 'bg-slate-100 text-slate-800',
      iconBg: 'bg-slate-100 text-slate-600',
      countText: 'text-slate-900'
    }
  };

  const current = schemeStyles[colorScheme] || schemeStyles.purple;

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border bg-white transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 ${
        isActive ? current.activeBorder : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-lg ${current.iconBg}`}>
          <Icon name={icon} className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${current.countText}`}>
          {count}
        </span>
        {subtitle && (
          <span className="text-xs text-slate-400 font-medium truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
