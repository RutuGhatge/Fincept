import React from 'react';

const testimonials = [
  { name: "Rahul S.", location: "Mumbai", text: "Finally, a dashboard that shows me everything. No more manual spreadsheets." },
  { name: "Ananya K.", location: "Bangalore", text: "The AI news filter is a game changer. I only read what matters now." },
  { name: "Vikas M.", location: "Delhi", text: "Fixed my emotional selling habit. The impact analysis is incredible." },
  { name: "Sneha P.", location: "Hyderabad", text: "Connected 3 brokers in minutes. Best investment platform in India." },
  { name: "Amit G.", location: "Pune", text: "The jargon explainer helped me understand my MF statements finally." },
  { name: "Priya R.", location: "Chennai", text: "Real-time valuations are accurate and fast. Love the glassmorphism UI." },
  { name: "Karthik B.", location: "Kolkata", text: "A&R saved me from overpaying on expense ratios. Hidden gem." },
  { name: "Sita R.", location: "Ahmedabad", text: "Smart portfolio keeps me on track for my long-term goals." },
  { name: "Arjun T.", location: "Gurgaon", text: "Technical analysis made simple. Highly recommend to retail investors." },
  { name: "Meera J.", location: "Jaipur", text: "One login for all my brokers. Pure convenience for modern investors." },
  { name: "Rohan D.", location: "Lucknow", text: "The news intelligence agent is worth every penny." },
  { name: "Tara S.", location: "Indore", text: "Premium feel, premium results. My go-to for market moves." }
];

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="shrink-0 w-80 bg-slate-50 border border-slate-100 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-default">
    <p className="text-stripe-slate text-base leading-relaxed mb-6 italic">"{item.text}"</p>
    <div>
      <p className="text-stripe-dark font-black text-sm uppercase tracking-wider">{item.name}</p>
      <p className="text-stripe-blue text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">{item.location}</p>
    </div>
  </div>
);

const Testimonials = () => {
  const row1 = testimonials.slice(0, 6);
  const row2 = testimonials.slice(6);

  return (
    <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
      <div className="mb-16 text-center px-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-stripe-blue mb-4">Testimonials</h2>
        <h3 className="text-4xl font-extrabold text-stripe-dark font-display">Loved by thousands of Indian investors.</h3>
      </div>

      <div className="space-y-8">
        {/* First Row */}
        <div className="marquee-container" style={{ '--duration': '30s', '--gap': '1.5rem' } as React.CSSProperties}>
          <div className="marquee-content">
            {row1.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {/* Duplicate for seamless loop */}
            {row1.map((item, i) => <TestimonialCard key={`dup1-${i}`} item={item} />)}
          </div>
        </div>

        {/* Second Row */}
        <div className="marquee-container" style={{ '--duration': '35s', '--gap': '1.5rem' } as React.CSSProperties}>
          <div className="marquee-content-reverse text-right">
            {row2.map((item, i) => <TestimonialCard key={i} item={item} />)}
            {/* Duplicate for seamless loop */}
            {row2.map((item, i) => <TestimonialCard key={`dup2-${i}`} item={item} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
