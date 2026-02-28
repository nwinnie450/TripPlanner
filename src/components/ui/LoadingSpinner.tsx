export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-ocean border-t-transparent" />
    </div>
  );
}
