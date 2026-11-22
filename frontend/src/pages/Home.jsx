import React from 'react';
import Hero from '../components/Hero';
import FeaturedSectionStats from '../components/ui/featured-section-stats';
import Offerings from '../components/Offerings';
import Advantages from '../components/Advantages';
import PortfolioPivot from '../components/PortfolioPivot';
import Testimonials from '../components/Testimonials';
import QNA from '../components/QNA';

const Home = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <FeaturedSectionStats />
      <Offerings />
      <Advantages />
      <PortfolioPivot />
      <Testimonials />
      <QNA />
    </div>
  );
};

export default Home;
