"use client";

export default function BackgroundAnimation() {
  return (
    <>
      {/* Static Zelij Pattern Background */}
      <div 
        className="fixed inset-0 -z-20 opacity-10"
        style={{
          backgroundImage: "url('/zelij.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
          backgroundPosition: "0 0"
        }}
      />
    </>
  );
}