import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Programs from "@/components/programs"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Footer />
    </main>
  )
}
