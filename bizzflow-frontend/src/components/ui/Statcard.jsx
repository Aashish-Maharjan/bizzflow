export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            {icon}
          </div>
        )}
        <h4 className="text-sm text-muted-foreground dark:text-gray-400">{title}</h4>
      </div>
      <span className="text-xl font-bold text-foreground dark:text-white">{value}</span>
    </div>
  );
}
  