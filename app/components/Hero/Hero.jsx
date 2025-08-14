import Image from 'next/image';

const Hero = () => {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-6 py-20 max-w-7xl mx-auto gap-12">
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Build Smarter. Launch Faster.
        </h1>
        <p className="text-lg sm:text-xl">
          A creative platform for building modern web experiences. Perfect for
          startups, creators, and dreamers.
        </p>
        <div className="flex justify-center lg:justify-start gap-4">
          <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition">
            Get Started
          </button>
          <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-indigo-600 transition">
            Learn More
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Image
          src="/landing-illustration.png"
          alt="Hero Illustration"
          width={500}
          height={500}
          className="mx-auto"
          priority="true"
        />
      </div>
    </section>
  );
};

export default Hero;
