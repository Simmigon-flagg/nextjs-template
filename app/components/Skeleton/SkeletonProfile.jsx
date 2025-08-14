const SkeletonProfile = () => {
  return (
    <section
      id="profile"
      className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6 animate-pulse"
    >
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
        <div className="bg-indigo-700 p-8 flex flex-col items-center justify-center md:col-span-1">
          <div className="w-28 h-28 bg-indigo-400 rounded-full mb-4"></div>
          <div className="h-4 bg-indigo-400 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-indigo-300 rounded w-2/4"></div>
        </div>
        <div className="p-8 md:col-span-2 space-y-4">
          <div className="h-5 bg-gray-300 w-40 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-300 w-24 rounded"></div>
                <div className="h-4 bg-gray-200 w-full rounded"></div>
              </div>
            ))}
          </div>
          <div>
            <div className="h-3 bg-gray-300 w-24 mb-2 rounded"></div>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
          </div>
          <div className="pt-4">
            <div className="h-10 bg-indigo-300 w-32 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonProfile;
