import clsx from 'clsx';

type SkeletonVariant = 'text' | 'card' | 'table' | 'chart';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

const shimmer = 'relative overflow-hidden bg-surface-border before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

function SkeletonBox({ width, height, className }: { width?: string | number; height?: string | number; className?: string }) {
  return (
    <div
      className={clsx(shimmer, 'rounded', className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

function TextSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={14}
          width={i === count - 1 ? '60%' : '100%'}
          className={i === count - 1 ? '' : ''}
        />
      ))}
    </div>
  );
}

function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-base p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonBox width={80} height={14} />
            <SkeletonBox width={32} height={32} className="rounded-lg" />
          </div>
          <SkeletonBox width={100} height={28} />
          <SkeletonBox width={60} height={12} />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      <div className="flex items-center px-4 py-3 border-b border-surface-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox key={i} width={`${80 + Math.random() * 60}px`} height={12} className="flex-1 mx-2" />
        ))}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={clsx('flex items-center px-4 py-3 border-b border-surface-border', i % 2 === 0 ? 'bg-white' : 'bg-surface/50')}>
          {Array.from({ length: 6 }).map((_, j) => (
            <SkeletonBox key={j} width={`${70 + Math.random() * 80}px`} height={12} className="flex-1 mx-2" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <SkeletonBox width={120} height={16} />
        <SkeletonBox width={80} height={12} />
      </div>
      <div className="flex items-end gap-2 h-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonBox
            key={i}
            width={`${100 / 12}%`}
            height={`${30 + Math.random() * 70}%`}
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'text', width, height, count = 3, className }: LoadingSkeletonProps) {
  if (width || height) {
    return <SkeletonBox width={width} height={height} className={className} />;
  }

  switch (variant) {
    case 'card':
      return <CardSkeleton count={count} />;
    case 'table':
      return <TableSkeleton count={count} />;
    case 'chart':
      return <ChartSkeleton />;
    case 'text':
    default:
      return <TextSkeleton count={count} />;
  }
}
