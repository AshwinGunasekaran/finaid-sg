export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-200">
        <div className="h-1 bg-blue-600 animate-pulse w-full" />
      </div>
    </div>
  )
}