import React from 'react';
import { Gauge } from 'lucide-react';

interface StanceIndicatorProps {
    stance?: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
    score?: number; // 0 to 100, where 0 is Max Bear, 50 Neutral, 100 Max Bull
}

const StanceIndicator: React.FC<StanceIndicatorProps> = ({ stance = 'NEUTRAL', score = 50 }) => {
    // Rotation logic: -90deg (Bear) to +90deg (Bull)
    // 0 score = -90deg
    // 50 score = 0deg
    // 100 score = +90deg
    const rotation = (score / 100) * 180 - 90;

    const getStanceColor = () => {
        if (score < 30) return 'text-red-500';
        if (score > 70) return 'text-green-500';
        return 'text-blue-500';
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-[250px]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 z-10">
                <Gauge className="text-vector-400" size={18} />
                Current Stance
            </h3>

            {/* Gauge Background */}
            <div className="relative w-48 h-24 overflow-hidden mb-4">
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-800 border-b-0" />
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent border-t-red-500/20 rotate-[-45deg] origin-center" style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }} />
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-transparent border-t-green-500/20 rotate-[45deg] origin-center" />

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-24 bg-gradient-to-t from-white to-transparent origin-bottom transition-transform duration-1000 ease-out z-20"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                />

                {/* Center Cap */}
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2 z-30 shadow-lg" />
            </div>

            <div className="text-center z-10">
                <div className={`text-2xl font-bold ${getStanceColor()}`}>
                    {stance}
                </div>
                <p className="text-slate-500 text-sm mt-1">
                    V-Score: {score}/100
                </p>
            </div>

            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
        </div>
    );
};

export default StanceIndicator;
