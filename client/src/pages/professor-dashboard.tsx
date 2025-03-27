import { useAuth } from "@/hooks/use-auth";
import { NavBar } from "@/components/nav-bar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Paper } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Redirect } from "wouter";
import { Loader2, File, Clock, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState("3");
  const [selectedPaperId, setSelectedPaperId] = useState<number | null>(null);

  // Redirect if not logged in as professor
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (user.role !== "professor") {
    return <Redirect to="/" />;
  }

  const {
    data: assignedPapers,
    isLoading: assignedLoading,
  } = useQuery<Paper[]>({
    queryKey: ["/api/professor/papers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const {
    data: pendingPapers,
    isLoading: pendingLoading,
  } = useQuery<Paper[]>({
    queryKey: ["/api/professor/pending-papers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const assignPaperMutation = useMutation({
    mutationFn: async (paperId: number) => {
      const res = await apiRequest(
        "POST",
        `/api/professor/assign-paper/${paperId}`
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professor/papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/professor/pending-papers"] });
      toast({
        title: "Paper assigned",
        description: "The paper has been assigned to you for review",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to assign paper",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviewPaperMutation = useMutation({
    mutationFn: async ({ paperId, comment, rating, feedback }: { paperId: number; comment: string; rating: number; feedback: string }) => {
      // First submit the review
      await apiRequest(
        "POST",
        `/api/professor/review-paper/${paperId}`,
        { comment, rating, feedback }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professor/papers"] });
      setFeedbackText("");
      setRating("3");
      setSelectedPaperId(null);
      toast({
        title: "Review submitted",
        description: "The paper has been successfully reviewed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleReviewSubmit(paperId: number) {
    if (!feedbackText.trim()) {
      toast({
        title: "Missing feedback",
        description: "Please provide feedback for the paper",
        variant: "destructive",
      });
      return;
    }

    reviewPaperMutation.mutate({
      paperId,
      comment: feedbackText,
      rating: parseInt(rating),
      feedback: feedbackText,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Professor Dashboard</h1>
          <p className="text-muted-foreground">
            Review and manage research papers submitted to you
          </p>
        </div>

        <Tabs defaultValue="assigned">
          <TabsList className="mb-6">
            <TabsTrigger value="assigned">Assigned Papers</TabsTrigger>
            <TabsTrigger value="pending">Pending Papers</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned">
            {assignedLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assignedPapers?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No papers assigned</h3>
                <p className="text-muted-foreground">
                  Go to the Pending Papers tab to assign papers for review
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {assignedPapers?.map((paper) => (
                  <Card key={paper.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <File className="h-5 w-5 text-primary" />
                        {paper.title}
                      </CardTitle>
                      <CardDescription>
                        Submitted {formatDistanceToNow(new Date(paper.submitted), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">Abstract</h4>
                        <p className="text-sm text-muted-foreground">{paper.abstract}</p>
                      </div>
                      
                      {selectedPaperId === paper.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="feedback">Your Feedback</Label>
                            <Textarea
                              id="feedback"
                              placeholder="Provide your detailed feedback for this paper..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              rows={5}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rating">Rating</Label>
                            <Select value={rating} onValueChange={setRating}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a rating" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - Poor</SelectItem>
                                <SelectItem value="2">2 - Below Average</SelectItem>
                                <SelectItem value="3">3 - Average</SelectItem>
                                <SelectItem value="4">4 - Good</SelectItem>
                                <SelectItem value="5">5 - Excellent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                    <CardFooter>
                      {selectedPaperId === paper.id ? (
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedPaperId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="ml-auto"
                            onClick={() => handleReviewSubmit(paper.id)}
                            disabled={reviewPaperMutation.isPending}
                          >
                            {reviewPaperMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Review
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedPaperId(paper.id)}
                          className="w-full"
                        >
                          Review Paper
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="flex justify-center my-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingPapers?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No pending papers</h3>
                <p className="text-muted-foreground">
                  There are currently no papers waiting for review
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pendingPapers?.map((paper) => (
                  <Card key={paper.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        {paper.title}
                      </CardTitle>
                      <CardDescription>
                        Submitted {formatDistanceToNow(new Date(paper.submitted), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">Abstract</h4>
                        <p className="text-sm text-muted-foreground">{paper.abstract}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Price:</span>
                        <span className="text-sm">₹{paper.price}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => assignPaperMutation.mutate(paper.id)}
                        disabled={assignPaperMutation.isPending}
                      >
                        {assignPaperMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Assign to Me
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}