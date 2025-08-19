import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-white">
      <h1 className="mb-12 text-5xl font-bold">게임을 선택하세요</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/ladder">
          <button className="w-full rounded-lg bg-blue-500 px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:bg-blue-600">
            사다리 게임
          </button>
        </Link>
        <Link href="/roulette">
          <button className="w-full rounded-lg bg-green-500 px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:bg-green-600">
            룰렛 게임
          </button>
        </Link>
        <button className="rounded-lg bg-red-500 px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:bg-red-600">
          게임 3
        </button>
        <button className="rounded-lg bg-yellow-500 px-8 py-4 text-2xl font-bold text-white transition-colors duration-300 hover:bg-yellow-600">
          게임 4
        </button>
      </div>
    </main>
  );
}
