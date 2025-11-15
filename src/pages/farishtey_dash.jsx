import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

const FarishteyDash = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ✅ Reuse Header */}
      <Header isHomepage={true} />

      <div className="flex flex-grow items-center justify-center p-4 mt-[-130px]">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">

          {/* 1. Book for Training */}
          <Link to="/book-training">
            <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <img
                src="/assets/Yi-Farishtey.png"
                alt="Book Training"
                className="w-40 h-auto hover:opacity-80 transition-opacity"
              />
              <p className="mt-2 text-lg font-semibold text-gray-800">Book for Training</p>
            </div>
          </Link>

          {/* 2. Register for Certificate */}
          <Link to="/register-certificate">
            <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <img
                src="/assets/registerCert.png"
                alt="Register Certificate"
                className="w-40 h-auto hover:opacity-80 transition-opacity"
              />
              <p className="mt-2 text-lg font-semibold text-gray-800">Register for Certificate</p>
            </div>
          </Link>

          {/* 3. Farishtey Videos */}
          <div 
            onClick={() => alert("Coming Soon!")}
            className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src="/assets/farishtey-videos.png"
              alt="Farishtey Videos"
              className="w-40 h-auto hover:opacity-80 transition-opacity"
            />
            <p className="mt-2 text-lg font-semibold text-gray-800">Farishtey Videos</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FarishteyDash;
