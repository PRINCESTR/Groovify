import { motion } from 'framer-motion';

const Skeleton = ({ className, width, height, circle }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="flex flex-col gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 h-full">
    <Skeleton className="aspect-square w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02]">
    <Skeleton width={48} height={48} />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

export default Skeleton;
