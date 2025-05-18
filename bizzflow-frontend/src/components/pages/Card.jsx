export default function Card({ title, value }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow flex flex-col items-center justify-center">
        <h4 className="text-sm text-gray-500 dark:text-gray-300">{title}</h4>
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
      </div>
    );
  }
  