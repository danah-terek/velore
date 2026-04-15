import React, { useState } from 'react';
import pic1 from '../../assets/pic1.jpg';  // ← FIXED
import pic2 from '../../assets/pic2.jpg';  // ← FIXED
import pic3 from '../../assets/pic3.jpg';  // ← FIXED
import logo from '../../assets/logo-blue.png';

const AiAdvisor = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-gray-200">

      {/* --- Hero Section --- */}
      <section className="max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase">
          Meet Your Personal Vision Assistant, <br className="hidden sm:block" /> Powered by AI Technology.
        </h1>
        <p className="text-sm italic text-gray-600 mb-6 sm:mb-8">
          Eyewear expertise is now at your fingertips.
        </p>
        <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base">
          VELORE's virtual assistant is designed to help you discover the perfect lenses and frames for your needs. 
          Get smart recommendations, personalized style suggestions, and guidance based on your vision, preferences, 
          and lifestyle. It's simple, intuitive, and ready to help you find eyewear that fits you perfectly—anytime, anywhere.
        </p>
      </section>

      {/* --- Demo Video Placeholder --- */}
      <section className="max-w-5xl mx-auto px-6 mb-16 sm:mb-20">
        <div className="relative aspect-video bg-[#D9D9D9] flex flex-col justify-end rounded-xl overflow-hidden shadow-md">
          <div className="bg-black/30 p-4 sm:p-6 flex items-center gap-3 cursor-pointer hover:bg-black/40 transition-all">
            <span className="text-white text-lg sm:text-xl">▶</span>
            <span className="text-white font-medium uppercase tracking-wider text-sm sm:text-base">Watch the Demo</span>
          </div>
        </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="max-w-4xl mx-auto px-6 mb-20 sm:mb-24">
        <div className="bg-[#444444] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[320px] shadow-xl">
          
          {/* Left Side */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 border-b md:border-b-0 md:border-r border-gray-500">
            <div className="flex items-center gap-2 mb-2">
              <img src={logo} alt="Velore Logo" className="h-10 sm:h-12 md:h-14 w-auto object-contain" />
            </div>
            <p className="text-white text-base sm:text-lg text-center">
              Frequently Asked Questions
            </p>
          </div>

          {/* Right Side FAQ */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-3 bg-[#333333]">

            {[
              {
                q: "What are the best frames for my face shape?",
                a: "Frame choice depends on your face shape. Round faces suit angular frames, while square faces look better with softer styles."
              },
              {
                q: "Which lenses work best for my children's needs?",
                a: "Children need impact-resistant lenses with UV protection. Blue-light filters can also help with screens."
              },
              {
                q: "Which glasses match my style?",
                a: "Your style depends on your personality and wardrobe. Minimal frames suit classic looks, bold frames suit expressive styles."
              }
            ].map((item, i) => {
              const isOpen = openIndex === i;

              return (
                <div key={i} className="border border-gray-600 rounded-xl overflow-hidden">
                  
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex justify-between items-center px-4 sm:px-5 py-3 text-left text-xs sm:text-sm text-gray-200 hover:bg-gray-700 transition-all"
                  >
                    <span>{item.q}</span>

                    {/* ✅ Plus / Minus Icon */}
                    <span className="text-lg sm:text-xl font-light transition-all duration-300">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`px-4 sm:px-5 text-xs sm:text-sm text-gray-400 transition-all duration-300 ${
                      isOpen ? "max-h-40 py-2" : "max-h-0 overflow-hidden"
                    }`}
                  >
                    {item.a}
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* --- Feature 1 --- */}
       {/* --- Feature 1: Curated Recommendations --- */}
      <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 order-2 md:order-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Choices specifically for you</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Powered by VELORE's expertise in optics and eyewear, along with insights from vision professionals 
            and optical specialists, the VELORE Virtual Assistant provides personalized recommendations for 
            frames, lenses, and sunglasses. It helps you discover eyewear that fits your face shape, vision needs, 
            and personal style for a smarter and more confident shopping experience.
          </p>
        </div>
        <div className="flex-1 order-1 md:order-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
            <img src={pic1} alt="Face scan" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-black/20">
              <p className="text-white text-xl sm:text-2xl font-medium drop-shadow-md">Precisely curated<br/>recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature 2: Real-time Try Ons --- */}
      <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
            <img src={pic2} alt="Try on" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-black/20">
              <p className="text-white text-xl sm:text-2xl font-medium drop-shadow-md">Real-time<br/>Try Ons</p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Explore the frames that suit you best</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            VELORE's virtual try-on feature lets you experiment with different glasses and sunglasses 
            in real time, helping you discover styles that truly fit you. Using advanced technology, 
            you can see how frames look on your face before you buy, making it easier to find the 
            perfect match for your face shape, vision needs, and personal style.
          </p>
        </div>
      </section>

      {/* --- Feature 3: Privacy --- */}
      <section className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 sm:mb-20">
        <div className="flex-1 order-2 md:order-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Your Data is Your Data</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Your personal data and privacy are fundamental rights. That's why Velore conversations 
            are private and secure. Voluntary consumer feedback, testing by professional beauty advisors.
          </p>
        </div>
        <div className="flex-1 order-1 md:order-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
            <img src={pic3} alt="Privacy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-black/20">
              <p className="text-white text-xl sm:text-2xl font-medium drop-shadow-md">Private and<br/>secure</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AiAdvisor;