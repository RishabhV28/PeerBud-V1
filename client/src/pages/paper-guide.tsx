import { NavBar } from "@/components/nav-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, FileText, Search, PenTool, FileCheck, Send, BookOpen, Quote, ListFilter, LayoutTemplate } from "lucide-react";

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
    icon: LayoutTemplate,
    title: "Paper Structure",
    description: `Your paper should follow this structure:
      • Title Page: Include title, author names, affiliations, and contact information
      • Abstract (150-250 words): Summarize your research, methodology, and findings
      • Introduction: Present background, research question, and objectives
      • Literature Review: Analyze existing research
      • Methodology: Detail your research approach
      • Results: Present findings without interpretation
      • Discussion: Interpret results and connect to existing literature
      • Conclusion: Summarize key findings and implications
      • References: List all cited sources`,
  },
  {
    icon: ListFilter,
    title: "Formatting Guidelines",
    description: `Follow these standard formatting rules:
      • Font: Times New Roman, 12pt
      • Spacing: Double-spaced throughout
      • Margins: 1 inch (2.54 cm) on all sides
      • Page Numbers: Bottom center or top right
      • Headers: Section headers in bold, aligned left
      • Figures & Tables: Numbered sequentially, with clear captions
      • Paragraphs: Indent first line by 0.5 inches`,
  },
  {
    icon: Quote,
    title: "Citation Style",
    description: `Choose and consistently follow one citation style:
      • APA Style: Most common in social sciences
      • MLA Style: Preferred in humanities
      • Chicago Style: Often used in history and economics
      • IEEE Style: Standard for engineering papers
      Include in-text citations and a complete reference list.`,
  },
  {
    icon: BookOpen,
    title: "Writing Style",
    description: `Maintain professional academic writing:
      • Use clear, concise language
      • Avoid jargon unless necessary
      • Write in third person (avoid "I" or "we")
      • Use active voice when possible
      • Define abbreviations on first use
      • Support claims with evidence
      • Maintain objective tone`,
  },
  {
    icon: Send,
    title: "Submit for Review",
    description:
      "Once your paper follows all formatting guidelines, submit it on Peerbud for expert review from top institutes. Higher review fees can expedite the process.",
  },
];

export default function PaperGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Research Paper Writing Guide</h1>
          <p className="text-lg text-muted-foreground">
            Follow this comprehensive guide to create a professionally formatted research paper
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
                <CardDescription className="text-base whitespace-pre-line">
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