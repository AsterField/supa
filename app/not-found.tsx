// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <p className="text-6xl mb-4">◎</p>
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">Page not found</h1>
      <p className="text-stone-400 text-sm mb-6">This page doesn't exist yet.</p>
      
        <a href="/"
        className="px-4 py-2 bg-stone-800 text-white rounded-xl text-sm no-underline hover:bg-stone-700 transition-colors"
      >
        Go home
      </a>
    </div>
  )
}