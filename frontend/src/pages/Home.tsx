import React from 'react';
import Hero from '../components/Hero';
import Offerings from '../components/Offerings';
import Advantages from '../components/Advantages';
import PortfolioPivot from '../components/PortfolioPivot';
import Testimonials from '../components/Testimonials';
import QNA from '../components/QNA';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      <Offerings />
      <Advantages />
      <PortfolioPivot />
      <Testimonials />
      <QNA />
    </div>
  );
};

export default Home;
