"use client";
import React from "react";

const SkeletonTodo = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-pulse">
        <div className="p-8 space-y-6">
          <div className="h-6 w-1/3 bg-gray-300 rounded"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-5 w-full bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-5 w-full bg-gray-300 rounded"></div>
            </div>
          </div>

          <div className="pt-6">
            <div className="h-10 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkeletonTodo;
