// Auto-generated landing page for the maths-primer module.
// Do not manually edit this file.
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MATHS-PRIMER Apps
          </h1>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Home
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4">
            <li className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
            <a href="/maths-primer/module-map" className="text-lg font-medium text-indigo-600 hover:text-indigo-800">
              Module Map
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
