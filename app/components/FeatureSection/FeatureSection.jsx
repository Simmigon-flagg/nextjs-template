'use client'
import { motion } from "framer-motion";

const FeatureSection = () => {
    return (
      <section className="bg-white text-gray-800 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div
            className="space-y-3 text-center"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold">⚡ Lightning Fast</h3>
            <p>Optimized performance with Next.js and server-side rendering out of the box.</p>
          </motion.div>

          <motion.div
            className="space-y-3 text-center"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold">🎨 Beautifully Designed</h3>
            <p>Built with TailwindCSS and modern UI practices to ensure elegance and clarity.</p>
          </motion.div>

          <motion.div
            className="space-y-3 text-center"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold">🧩 Modular Architecture</h3>
            <p>Craft your app with components that are reusable, testable, and easy to scale.</p>
          </motion.div>
        </div>
      </section>
    )
}

export default FeatureSection