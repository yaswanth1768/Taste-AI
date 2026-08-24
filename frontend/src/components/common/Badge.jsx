import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all';
  
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm font-semibold'
  };

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700/50',
    primary: 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30',
    cyan: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
    emerald: 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30',
    rose: 'bg-brand-rose/20 text-brand-rose border border-brand-rose/30',
    amber: 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30',
    glass: 'bg-white/10 text-white backdrop-blur-md border border-white/15'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
