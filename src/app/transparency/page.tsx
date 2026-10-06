import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";

export default function Page() {
  return (
    <main className="bg-[#07090b] text-white">
      <div className="noise" />
      <Header />
      <section className="min-h-[70vh] pt-40 pb-24">
        <Container>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
            Arvo
          </p>
          <h1 className="text-balance text-6xl font-semibold tracking-[-0.07em] md:text-8xl">
            Transparency
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 text-white/60">
            This page will be designed as part of the full Arvo experience.
          </p>
        </Container>
      </section>
      <Footer />
    </main>
  );
}
