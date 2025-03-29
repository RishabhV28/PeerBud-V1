import { NavBar } from "@/components/nav-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPaperSchema, type InsertPaper, INSTITUTES } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function UploadPaper() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertPaper & { institute: string }>({
    resolver: zodResolver(insertPaperSchema.extend({
      institute: z.string().min(1, "Please select an institute")
    })),
    defaultValues: {
      price: 2000,
      institute: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: InsertPaper & { file: File, institute: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      formData.append("abstract", data.abstract);
      formData.append("price", data.price.toString());
      formData.append("institute", data.institute);

      const res = await fetch("/api/papers", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload paper");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paper uploaded successfully",
        description: "We'll notify you once the review is complete",
      });
      setLocation("/papers");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload paper",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Upload Research Paper</h1>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  const fileInput = document.querySelector<HTMLInputElement>(
                    'input[type="file"]',
                  );
                  if (!fileInput?.files?.[0]) {
                    toast({
                      title: "Please select a file",
                      variant: "destructive",
                    });
                    return;
                  }
                  uploadMutation.mutate({
                    ...data,
                    file: fileInput.files[0],
                  });
                })}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Paper File (PDF)</FormLabel>
                  <FormControl>
                    <Input type="file" accept=".pdf" />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="institute"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submit to Institute</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an institute" />
                          </SelectTrigger>
                          <SelectContent>
                            {INSTITUTES.map((inst) => (
                              <SelectItem key={inst} value={inst}>
                                {inst}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Review Price: ₹{field.value}
                        <span className="text-sm text-muted-foreground ml-2">
                          (Higher price = Faster review)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={1000}
                          max={3000}
                          step={500}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload Paper
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
