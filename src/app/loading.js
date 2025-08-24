'use client';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Animated Logo Container */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-spin opacity-75"></div>
          
          {/* Inner rotating ring - opposite direction */}
          <div className="absolute inset-2 w-28 h-28 mx-auto rounded-full bg-gradient-to-r from-yellow-500 via-green-500 to-red-500 animate-spin-reverse opacity-50"></div>
          
          {/* Logo container */}
          <div className="relative w-32 h-32 mx-auto bg-gray-800/80 backdrop-blur-xl rounded-full shadow-2xl border border-gray-700/50 flex items-center justify-center animate-pulse">
            <div className="w-24 h-24 relative animate-bounce">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain filter drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            Loading...
          </h2>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-green-500 rounded-full animate-bounce delay-300"></div>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
      `}</style>
    </div>
  );
}