import HeroScroll from '@/components/HeroScroll';
import Globe from '@/components/Globe';
import Navbar from '@/components/Navbar';
import TypographySequence from '@/components/TypographySequence';
import ExpandingImage from '@/components/ExpandingImage';
import RouteMap from '@/components/RouteMap';

export default function Home() {
  return (
    <main className="w-full" style={{ backgroundColor: '#050505', color: '#FAFAFA' }}>
      <Navbar />
      <HeroScroll />
      {/* Thin gold separator */}
      <div className="w-full" style={{ backgroundColor: '#050505' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.18), transparent)' }} />
        </div>
      </div>
      <TypographySequence />
      {/* Thin gold separator */}
      <div className="w-full" style={{ backgroundColor: '#050505' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.18), transparent)' }} />
        </div>
      </div>
      <ExpandingImage />
      <RouteMap />
      <Globe />
    </main>
  );
}
