import { NavBar } from "@/components/nav-bar";
import { useQuery } from "@tanstack/react-query";
import type { Paper } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Mock data for demonstration
const MOCK_PAPERS: Paper[] = [
  {
    id: 1,
    title: "Advanced Machine Learning in Healthcare",
    abstract: "A study on ML applications in healthcare diagnostics",
    filePath: "/papers/ml-healthcare.pdf",
    userId: 2,
    price: 2500,
    status: "approved",
    submitted: new Date("2024-02-15").toISOString(),
  },
  {
    id: 2,
    title: "Sustainable Energy Solutions",
    abstract: "Research on renewable energy implementation",
    filePath: "/papers/renewable-energy.pdf",
    userId: 3,
    price: 3000,
    status: "approved",
    submitted: new Date("2024-02-20").toISOString(),
  },
  {
    id: 3,
    title: "Quantum Computing Advancements",
    abstract: "Latest developments in quantum computing",
    filePath: "/papers/quantum-computing.pdf",
    userId: 4,
    price: 2000,
    status: "approved",
    submitted: new Date("2024-03-01").toISOString(),
  },
];

export default function AllPapersPage() {
  const { data: papers, isLoading } = useQuery<Paper[]>({
    queryKey: ["/api/papers/all"],
    initialData: MOCK_PAPERS, // Use mock data as initial data
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Published Papers</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers?.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{paper.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {paper.abstract}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(paper.submitted), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {paper.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
