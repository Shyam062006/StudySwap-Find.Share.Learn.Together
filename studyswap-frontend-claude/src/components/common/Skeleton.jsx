export default function Skeleton({ h = 14, w = '100%', style }) { return <div className="skeleton" style={{ height: h, width: w, ...style }} aria-hidden="true" />; }
export function CardSkeletons({ count = 6 }) {
  return (
    <div className="grid grid-resources" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card stack"><Skeleton h={40} w={40} /><Skeleton h={18} w="80%" /><Skeleton w="50%" /><Skeleton w="65%" /></div>
      ))}
    </div>
  );
}
