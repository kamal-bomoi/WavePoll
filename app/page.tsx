import { Container, Stack } from "@mantine/core";
import { CallToAction } from "@/components/call-to-action";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";

/**
 * Renders the landing page composed of the site header, hero, features, how-it-works section, call-to-action, and footer.
 *
 * The content is wrapped in a responsive Container and vertical Stack and styled with page-specific class names.
 *
 * @returns The JSX element for the complete landing page layout
 */
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
