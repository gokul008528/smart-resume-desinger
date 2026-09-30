export default function Avatar({ src, name = 'User', size = 36, className = '' }) {
  const initials = String(name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 ${className}`}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-500 font-bold text-white ${className}`}
    >
      {initials}
    </span>
  );
}
