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
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload } from "lucide-react";

export default function PapersPage() {
  const { data: papers } = useQuery<Paper[]>({ queryKey: ["/api/papers"] });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Papers</h1>
          <Link href="/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Paper
            </Button>
          </Link>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers?.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-medium">{paper.title}</TableCell>
                  <TableCell>
                    {format(new Date(paper.submitted), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>₹{paper.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={paper.status === "pending" ? "secondary" : "default"}
                    >
                      {paper.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
