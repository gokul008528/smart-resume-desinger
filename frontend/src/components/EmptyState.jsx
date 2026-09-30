export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-500/10">
          <Icon size={26} />
        </span>
      )}
      <div>
        <h3 className="font-bold">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      </div>
      {action}
    </div>
  );
}
