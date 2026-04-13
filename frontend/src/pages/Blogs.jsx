import blogImg from "../assets/blogimage.png";
import { useNavigate } from "react-router-dom";

export default function Blogs() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] flex justify-center items-start py-10 px-4">

      <div className="w-full max-w-[900px] relative">

        {/* IMAGE */}
        <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={blogImg}
            alt="blog"
            className="w-full h-full object-cover"
          />

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow text-sm hover:bg-white transition"
          >
            ←
          </button>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-[#dcdcdc] p-6 md:p-10 -mt-16 md:-mt-24 shadow-lg relative z-10">

          {/* DATE */}
          <p className="text-sm text-gray-600 mb-4">Mar 4, 2026</p>

          {/* TITLE */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
            From lens tech luxury frames
          </h1>

          {/* TEXT */}
          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
            From lens tech to luxury frames, eyewear has evolved into a perfect blend of
            innovation and style.
            <br /><br />
            Advanced features like blue light protection, anti-reflective coatings, and
            high-index lightweight lenses ensure maximum comfort and clarity in today's
            digital world. At the same time, iconic brands such as Ray-Ban, Gucci, and
            Cartier have transformed frames
          </p>

          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
            into fashion statements, using premium materials and bold designs to express
            individuality. Modern eyewear is no longer just about correcting vision —
            it's about enhancing confidence, showcasing personality, and combining
            smart technology with timeless elegance.
          </p>

          {/* CONCLUSION */}
          <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">
            Conclusion
          </h2>

          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
            Advanced features like blue light protection, anti-reflective coatings, and
            high-index lightweight lenses ensure maximum comfort and clarity in today's
            digital world.
          </p>

          {/* SHARE */}
          <div className="flex items-center gap-4 text-gray-700">
            <span className="text-sm font-medium">Share:</span>

            <span className="cursor-pointer hover:underline">FB</span>
            <span className="cursor-pointer hover:underline">IG</span>
            <span className="cursor-pointer hover:underline">TW</span>
          </div>

        </div>
      </div>
    </div>
  );
}