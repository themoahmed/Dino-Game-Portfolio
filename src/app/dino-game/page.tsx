import DinoGame from "../../components/DinoGame";

export default function DinoGamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-pulpo font-[500] mb-6">Chrome Dino Game</h1>
      <div className="w-full max-w-4xl">
        <DinoGame />
      </div>
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-2">
          Use the up arrow key or space bar to jump and avoid obstacles
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
