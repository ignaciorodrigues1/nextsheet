import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Thesis from '@/components/Thesis'
import GettingStarted from '@/components/GettingStarted'
import HowItWorks from '@/components/HowItWorks'
import Backends from '@/components/Backends'
import Charts from '@/components/Charts'
import Deploy from '@/components/Deploy'
import Roadmap from '@/components/Roadmap'
import CTABand from '@/components/CTABand'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Thesis />
      <GettingStarted />
      <HowItWorks />
      <Backends />
      <Charts />
      <Deploy />
      <Roadmap />
      <CTABand />
      <Footer />
    </>
  )
}
