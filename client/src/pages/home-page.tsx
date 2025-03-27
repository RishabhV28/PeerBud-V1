import { NavBar } from "@/components/nav-bar";
import { InstitutesGrid } from "@/components/institutes-grid";
import { FeatureSection } from "@/components/feature-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main>
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Get Your Research Peer Reviewed
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Connect with top academic institutes for professional peer review of your research papers
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="gap-2">
                  Upload Your Paper <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/papers/all">
                <Button size="lg" variant="outline" className="gap-2">
                  Browse Papers <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <InstitutesGrid />
        </section>

        <FeatureSection />
      </main>
    </div>
  );
}
