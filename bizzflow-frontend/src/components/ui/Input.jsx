import React from 'react';

const variants = {
    outline: `
        border
        border-gray-300
        dark:border-gray-600
        bg-white
        dark:bg-gray-800
        focus:border-blue-500
        dark:focus:border-blue-400
    `,
    filled: `
        border
        border-transparent
        bg-gray-100
        dark:bg-gray-700
        focus:bg-white
        dark:focus:bg-gray-800
        focus:border-blue-500
        dark:focus:border-blue-400
    `,
    flushed: `
        border-0
        border-b-2
        border-gray-300
        dark:border-gray-600
        rounded-none
        bg-transparent
        px-0
        focus:border-blue-500
        dark:focus:border-blue-400
    `,
    unstyled: `
        border-0
        bg-transparent
        px-0
        rounded-none
    `
};

const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
};

export const Input = React.forwardRef(({
    className = '',
    variant = 'outline',
    size = 'md',
    error,
    label,
    helperText,
    leftElement,
    rightElement,
    isRequired,
    isDisabled,
    isReadOnly,
    ...props
}, ref) => {
    const inputWrapperClasses = `
        relative
        w-full
        group
        ${variant === 'flushed' ? '' : 'rounded-lg'}
        ${error ? 'shadow-error' : ''}
    `;

    const inputClasses = `
        w-full
        transition-colors
        duration-200
        text-gray-900
        dark:text-white
        placeholder:text-gray-500
        dark:placeholder:text-gray-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/20
        dark:focus:ring-blue-400/20
        ${error ? 'border-red-500 dark:border-red-400' : ''}
        ${variants[variant]}
        ${sizes[size]}
        ${leftElement ? 'pl-10' : ''}
        ${rightElement ? 'pr-10' : ''}
        ${className}
    `;

    const labelClasses = `
        block
        text-sm
        font-medium
        mb-1.5
        text-gray-700
        dark:text-gray-300
    `;

    const helperTextClasses = `
        mt-1.5
        text-xs
        ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}
    `;

    const elementClasses = `
        absolute
        top-1/2
        -translate-y-1/2
        text-gray-500
        dark:text-gray-400
        pointer-events-none
    `;

    return (
        <div className="w-full">
            {label && (
                <label className={labelClasses}>
                    {label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className={inputWrapperClasses}>
                {leftElement && (
                    <span className={`${elementClasses} left-3`}>
                        {leftElement}
                    </span>
                )}
                <input
                    ref={ref}
                    className={inputClasses}
                    disabled={isDisabled}
                    readOnly={isReadOnly}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={helperText ? 'helper-text' : undefined}
                    {...props}
                />
                {rightElement && (
                    <span className={`${elementClasses} right-3`}>
                        {rightElement}
                    </span>
                )}
            </div>
            {(helperText || error) && (
                <p id="helper-text" className={helperTextClasses}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});
