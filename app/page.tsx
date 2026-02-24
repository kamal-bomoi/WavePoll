import { Container, Stack } from "@mantine/core";
import { CallToAction } from "@/components/call-to-action";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";

export default function LandingPage() {
  return (
    <div className="wave-page wave-landing-page">
      <Container size="lg">
        <Stack gap="lg" className="wave-slide-up">
          <Header />
          <Hero />
          <Features />
          <HowItWorks />
          <CallToAction />
          <Footer />
        </Stack>
      </Container>
    </div>
  );
}
