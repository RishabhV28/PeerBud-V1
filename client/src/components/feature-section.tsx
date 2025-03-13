import { Card, CardContent } from "@/components/ui/card";
import { Check, Brain, Globe, Users } from "lucide-react";

const FEATURES = [
  {
    title: "Get your papers peer reviewed from top institutes",
    description: "Expert review from India's leading academic institutions",
    icon: Check,
  },
  {
    title: "Publish your papers for the world to see",
    description: "Share your research with the global academic community",
    icon: Globe,
  },
  {
    title: "Get your papers checked by AI",
    description: "Advanced AI analysis for preliminary feedback",
    icon: Brain,
  },
  {
    title: "Collaborate with our platform to boost your credibility",
    description: "Build your academic reputation through our network",
    icon: Users,
  },
] as const;

export function FeatureSection() {
  return (
    <section className="py-20 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Peerbud?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6 flex gap-4">
                <feature.icon className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
