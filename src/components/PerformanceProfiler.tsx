import React from 'react';
import { PerformanceMetrics } from '../types';
import { Cpu, Activity, Layers, Box, Zap, Database } from 'lucide-react';

interface PerformanceProfilerProps {
  metrics: PerformanceMetrics | null;
  onClose: () => void;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({ metrics, onClose }) => {
  if (!metrics) return null;

  const fpsColor =
    metrics.fps >= 55 ? 'text-emerald-400' : metrics.fps >= 30 ? 'text-amber-400' : 'text-rose-500';

  const drawCallsOptimal = metrics.drawCalls <= 20;

  return (
    <div className="absolute top-16 left-4 z-20 pointer-events-auto bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-4 text-xs font-mono w-72 backdrop-blur-md shadow-2xl text-slate-200">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>ENGINE PROFILER</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white font-bold px-1">
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        {/* FPS & Frame Time */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Frame Rate:
          </span>
          <span className={`font-black text-sm ${fpsColor}`}>
            {metrics.fps} FPS ({metrics.frameTimeMs}ms)
          </span>
        </div>

        {/* Draw Calls Batch Rendering */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> GPU Draw Calls:
          </span>
          <span className={`font-bold ${drawCallsOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.drawCalls} {drawCallsOptimal ? '(Batch Instanced)' : ''}
          </span>
        </div>

        {/* Triangles & Geometry */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-indigo-400" /> Triangles Rendered:
          </span>
          <span className="font-bold text-slate-200">{metrics.triangles.toLocaleString()}</span>
        </div>

        {/* Object Pool Recycling */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" /> Object Pool Recycled:
          </span>
          <span className="font-bold text-purple-300">
            {metrics.activePoolObjects} / {metrics.totalPoolObjects}
          </span>
        </div>

        {/* Web Worker Physics Latency */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Worker Thread Latency:
          </span>
          <span className="font-bold text-emerald-400">{metrics.workerLatencyMs.toFixed(2)} ms</span>
        </div>

        {/* Spatial Partitioning Grid Nodes */}
        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400">Spatial Hash Cells:</span>
          <span className="font-bold text-cyan-300">{metrics.spatialGridNodes} active</span>
        </div>
      </div>
    </div>
  );
};
