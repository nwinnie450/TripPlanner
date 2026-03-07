export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center gap-2 p-8">
      <span
        className="inline-block h-3 w-3 rounded-full bg-ocean animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="inline-block h-3 w-3 rounded-full bg-pink animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="inline-block h-3 w-3 rounded-full bg-sunset animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}
