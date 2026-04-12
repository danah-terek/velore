import heroImg from "../assets/photoshoot.png";

export default function Home() {
  return (
    <div>

      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] md:h-screen overflow-hidden">

        {/* IMAGE */}
        <img
          src={heroImg}
          alt="Eyewear"
          className="w-full h-full object-cover"
        />

        {/* CONTENT */}
        <div className="absolute top-1/2 left-4 md:left-12 transform -translate-y-1/2 max-w-lg z-10 px-2">

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-white md:text-gray-800 leading-tight">
            Eyewear that fits you before you buy
          </h1>

          <div className="mt-6 flex flex-wrap gap-4">
            <button className="bg-gray-800 text-white px-5 py-3 rounded-md hover:bg-gray-900 transition">
              Shop now
            </button>

            <button className="bg-gray-800 text-white px-5 py-3 rounded-md hover:bg-gray-900 transition">
              Try Virtual Try-On
            </button>
          </div>
        </div>
      </section>

      <h1>Hello</h1>

    </div>
  );
}