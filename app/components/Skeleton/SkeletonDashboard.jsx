const SkeletonDashboard = () => {
  return (
    <section className="py-20 px-6 animate-pulse bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-gray-300 w-40 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow space-y-4">
              <div className="h-5 bg-gray-200 w-1/2 rounded"></div>
              <div className="h-10 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkeletonDashboard;
