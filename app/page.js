import Image from 'next/image';
import Hero from './components/Hero/Hero';
import FeatureSection from './components/FeatureSection/FeatureSection';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col py-10">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <FeatureSection />

      {/* Call to Action */}
      <section className="bg-indigo-800 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="mb-6">Join the future of web development today</p>
        <button className="bg-white text-indigo-800 px-8 py-4 rounded-xl font-semibold shadow hover:bg-gray-100 transition">
          <Link href={'/createaccount'}> Create Your Account</Link>
        </button>
      </section>
    </main>
  );
}
