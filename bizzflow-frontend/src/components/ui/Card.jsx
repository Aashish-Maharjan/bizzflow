// src/components/Card.jsx

export default function Card({ title, value, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow space-y-2">
      {title && (
        <h4 className="text-sm text-gray-500 dark:text-gray-300">{title}</h4>
      )}
      {value && (
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {value}
        </span>
      )}
      {children}
    </div>
  );
}
