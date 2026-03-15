export function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-gray-700 rounded-full animate-spin border-t-primary-500" />
      <p className="mt-4 text-gray-400">{text}</p>
    </div>
  );
}