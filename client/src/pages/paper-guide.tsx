import { NavBar } from "@/components/nav-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, FileText, Search, PenTool, FileCheck, Send } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Choose Your Research Topic",
    description:
      "Select a topic that interests you and has scope for original research. Make sure it's specific enough to be manageable but broad enough to find sufficient sources.",
  },
  {
    icon: FileText,
    title: "Literature Review",
    description:
      "Read and analyze existing research in your field. This helps you understand the current state of knowledge and identify gaps your research can fill.",
  },
  {
    icon: PenTool,
    title: "Develop Your Thesis",
    description:
      "Form a clear, specific thesis statement that outlines your research question and main argument. This will guide your entire paper.",
  },
  {
    icon: FileCheck,
    title: "Research Methodology",
    description:
      "Design your research methodology. This could include experiments, surveys, data analysis, or theoretical frameworks depending on your field.",
  },
  {
    icon: Check,
    title: "Write and Structure",
    description:
      "Follow the standard research paper structure: Abstract, Introduction, Methodology, Results, Discussion, and Conclusion. Write clearly and cite all sources.",
  },
  {
    icon: Send,
    title: "Submit for Review",
    description:
      "Once your paper is complete, submit it on Peerbud for expert review from top institutes. Higher review fees can expedite the process.",
  },
];

export default function PaperGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How to Write a Research Paper</h1>
          <p className="text-lg text-muted-foreground">
            Follow this comprehensive guide to create a high-quality research paper
          </p>
        </div>

        <div className="grid gap-6">
          {STEPS.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <step.icon className="h-6 w-6 text-primary" />
                  <span>Step {index + 1}: {step.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
