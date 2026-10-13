import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  iconStyle?: 'dark' | 'amber' | 'green' | 'orange';
}

const ICON_STYLES = {
  dark: {
    wrapper: 'bg-[#3A1E08] text-amber-400',
  },
  amber: {
    wrapper: 'bg-amber-100 text-amber-700',
  },
  green: {
    wrapper: 'bg-emerald-100 text-emerald-700',
  },
  orange: {
    wrapper: 'bg-orange-100 text-orange-700',
  },
};

const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel = 'dari bulan lalu',
  iconStyle = 'amber',
}) => {
  const trendIsPositive =
    typeof trend === 'number' && trend > 0;

  const trendIsNegative =
    typeof trend === 'number' && trend < 0;

  const TrendIcon = trendIsPositive
    ? ArrowUpRight
    : trendIsNegative
      ? ArrowDownRight
      : Minus;

  const trendColor = trendIsPositive
    ? 'text-emerald-600 bg-emerald-50'
    : trendIsNegative
      ? 'text-red-600 bg-red-50'
      : 'text-stone-500 bg-stone-100';

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-stone-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(58,30,8,0.04)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_14px_35px_rgba(58,30,8,0.08)]
      "
    >
      {/* Decorative Glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-amber-100/40
          blur-2xl
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="
                text-xs
                font-semibold
                text-stone-400
              "
            >
              {title}
            </p>

            <p
              className="
                mt-2
                font-display
                text-2xl
                sm:text-3xl
                font-extrabold
                tracking-tight
                text-[#241305]
              "
            >
              {value}
            </p>
          </div>

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition-transform
              duration-300
              group-hover:scale-105
              ${ICON_STYLES[iconStyle].wrapper}
            `}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-center gap-2">
          {typeof trend === 'number' && (
            <span
              className={`
                inline-flex
                items-center
                gap-0.5
                rounded-md
                px-1.5
                py-1
                text-[10px]
                font-bold
                ${trendColor}
              `}
            >
              <TrendIcon
                className="h-3 w-3"
                strokeWidth={2.5}
                aria-hidden="true"
              />

              {Math.abs(trend)}%
            </span>
          )}

          <span
            className="
              min-w-0
              truncate
              text-[10px]
              text-stone-400
            "
          >
            {description || trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;