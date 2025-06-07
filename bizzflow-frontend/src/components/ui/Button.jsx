import React from 'react';

const variants = {
    // Solid Variants
    primary: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white shadow-sm hover:shadow-md',
    success: 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700 shadow-sm hover:shadow-md',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-700 shadow-sm hover:shadow-md',
    
    // Soft Variants
    'primary-soft': 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-300',
    'secondary-soft': 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300',
    'success-soft': 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/40 dark:text-green-300',
    'danger-soft': 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/40 dark:text-red-300',
    'warning-soft': 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/40 dark:text-yellow-300',
    'info-soft': 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/40 dark:text-cyan-300',
    
    // Outline Variants
    'primary-outline': 'border-2 border-blue-500 hover:bg-blue-50 text-blue-600 dark:border-blue-400 dark:hover:bg-blue-950 dark:text-blue-400',
    'secondary-outline': 'border-2 border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-900 dark:text-gray-400',
    'success-outline': 'border-2 border-green-500 hover:bg-green-50 text-green-600 dark:border-green-400 dark:hover:bg-green-950 dark:text-green-400',
    'danger-outline': 'border-2 border-red-500 hover:bg-red-50 text-red-600 dark:border-red-400 dark:hover:bg-red-950 dark:text-red-400',
    'warning-outline': 'border-2 border-yellow-500 hover:bg-yellow-50 text-yellow-600 dark:border-yellow-400 dark:hover:bg-yellow-950 dark:text-yellow-400',
    'info-outline': 'border-2 border-cyan-500 hover:bg-cyan-50 text-cyan-600 dark:border-cyan-400 dark:hover:bg-cyan-950 dark:text-cyan-400',
    
    // Ghost Variants
    'primary-ghost': 'hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-950 dark:text-blue-400',
    'secondary-ghost': 'hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-900 dark:text-gray-400',
    'success-ghost': 'hover:bg-green-50 text-green-600 dark:hover:bg-green-950 dark:text-green-400',
    'danger-ghost': 'hover:bg-red-50 text-red-600 dark:hover:bg-red-950 dark:text-red-400',
    'warning-ghost': 'hover:bg-yellow-50 text-yellow-600 dark:hover:bg-yellow-950 dark:text-yellow-400',
    'info-ghost': 'hover:bg-cyan-50 text-cyan-600 dark:hover:bg-cyan-950 dark:text-cyan-400',
    
    // Link Variants
    'primary-link': 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300',
    'secondary-link': 'text-gray-600 hover:text-gray-700 underline-offset-4 hover:underline dark:text-gray-400 dark:hover:text-gray-300',
    'success-link': 'text-green-600 hover:text-green-700 underline-offset-4 hover:underline dark:text-green-400 dark:hover:text-green-300',
    'danger-link': 'text-red-600 hover:text-red-700 underline-offset-4 hover:underline dark:text-red-400 dark:hover:text-red-300',
    'warning-link': 'text-yellow-600 hover:text-yellow-700 underline-offset-4 hover:underline dark:text-yellow-400 dark:hover:text-yellow-300',
    'info-link': 'text-cyan-600 hover:text-cyan-700 underline-offset-4 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300'
};

const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
    '2xl': 'px-8 py-4 text-xl'
};

const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6',
    '2xl': 'h-7 w-7'
};

export const Button = React.forwardRef(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    children,
    ...props
}, ref) => {
    const iconClassName = iconSizes[size];
    
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`
                inline-flex
                items-center
                justify-center
                gap-2
                font-medium
                rounded-lg
                transition-all
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-offset-white
                dark:focus:ring-offset-gray-900
                ${variant.includes('link') ? '' : 'focus:ring-current/30'}
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg
                        className={`animate-spin ${iconClassName}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {leftIcon && <span className={iconClassName}>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className={iconClassName}>{rightIcon}</span>}
                </>
            )}
        </button>
    );
});
