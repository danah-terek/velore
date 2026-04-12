import { useState } from "react";

const testimonials = [
  {
    name: "Danah Terek",
    rating: 4,
    review:
      "it was amazing ahaha meow, it fits perfclty ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses",
  },
  {
    name: "Léa Mazmanian",
    rating: 4,
    review:
      "it was amazing ahaha meow, it fits perfclty ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses",
  },
  {
    name: "Cookie Meow",
    rating: 5,
    review:
      "it was amazing ahaha meow, it fits perfclty ahaaah meow meow meow ahahaah very good meow mewo ahahaa i was wondering if i can go with my lenses",
  },
];

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: 36, height: 36, color: "#555" }}
    >
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function Stars({ rating, total = 5 }) {
  return (
    <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "8px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 20,
            color: i < rating ? "#F5C518" : "#D1D5DB",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function TestimonialCard({ name, rating, review }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#F3F4F6",
        borderRadius: 16,
        padding: "56px 24px 32px",
        marginTop: 40,
        textAlign: "center",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#D1D5DB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UserIcon />
      </div>

      <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: 0 }}>{name}</p>
      <Stars rating={rating} />
      <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{review}</p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section style={{ background: "#fff", padding: "48px 24px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: 30, fontWeight: 700, color: "#111827", marginBottom: 48 }}>
        Testimonials
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </div>
    </section>
  );
}
