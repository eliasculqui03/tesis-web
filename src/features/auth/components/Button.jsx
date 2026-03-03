export default function Button({
  children,
  loading,
  className = "",
  ...props
}) {
  return (
    <button
      className={`w-full py-3 px-4 rounded-xl bg-gold text-navy-deep font-bold hover:bg-gold-light active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-gold/5 font-jakarta ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
