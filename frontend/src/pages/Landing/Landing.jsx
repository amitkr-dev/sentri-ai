import Navbar         from '../../components/layout/Navbar'
import Footer         from '../../components/layout/Footer'
import Hero           from '../../sections/Hero'
import TrustBadges    from '../../sections/TrustBadges'
import Problem        from '../../sections/Problem'
import AIThinking     from '../../sections/AIThinking'
import RiskPrediction from '../../sections/RiskPrediction'
import RescueMode     from '../../sections/RescueMode'
import Features       from '../../sections/Features'
import HowItWorks     from '../../sections/HowItWorks'
import InteractiveDemo from '../../sections/InteractiveDemo'
import Comparison     from '../../sections/Comparison'
import Technology     from '../../sections/Technology'
import Metrics        from '../../sections/Metrics'
import FAQ            from '../../sections/FAQ'
import CTA            from '../../sections/CTA'

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <Problem />
        <HowItWorks />
        <AIThinking />
        <RiskPrediction />
        <RescueMode />
        <Features />
        <InteractiveDemo />
        <Comparison />
        <Technology />
        <Metrics />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
