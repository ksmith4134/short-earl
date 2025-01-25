"use client";

import clsx from "clsx";

export function SubmitButton({
  isPending = false,
  className = "",
  label = "Submit",
}) {
  return (
      <button
        type='submit'
        aria-disabled={isPending}
        disabled={isPending}
        className={clsx(
          "rounded-lg px-4 py-3 text-sm",
          {
            "bg-gray-200 text-gray-400": isPending,
            "bg-gray-800 text-white transition duration-300 ease-in-out hover:bg-black": !isPending,
          },
          className
        )}
      >
        {isPending ? "Submitting..." : label}
      </button>
  );
}

export function FormInputError({
  message = '',
  errors = [],
}) {
  return (
    <div className="min-h-6 w-full pt-1">
      {errors.map((error, index) => (
        <div
          key={index}
          className="text-xs text-red-500"
          dangerouslySetInnerHTML={{ __html: error }}
        ></div>
      ))}
      {message && (
        <div
          className="text-xs text-red-500"
          dangerouslySetInnerHTML={{ __html: message }}
        ></div>
      )}
    </div>
  );
}