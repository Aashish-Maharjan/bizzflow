// src/components/Label.jsx

export default function Label({ children, htmlFor }) {
    return (
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {children}
      </label>
    );
  }
  