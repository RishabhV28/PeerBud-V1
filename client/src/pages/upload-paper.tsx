import { NavBar } from "@/components/nav-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPaperSchema, INSTITUTES } from "@shared/schema";
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

  // Define our custom form type with file upload
  type PaperForm = {
    title: string;
    abstract: string;
    price: number;
    institute: string;
    file: File | null;
  };

  const paperFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    abstract: z.string().min(1, "Abstract is required"),
    price: z.number().min(1000).max(3000),
    institute: z.string().min(1, "Please select an institute"),
    file: z.instanceof(File, { message: "Please upload a PDF file" }).nullable(),
  });
  
  const form = useForm<PaperForm>({
    resolver: zodResolver(paperFormSchema),
    defaultValues: {
      price: 2000,
      institute: "",
      file: null,
      title: "",
      abstract: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: PaperForm) => {
      if (!data.file) {
        throw new Error("No file selected");
      }
      
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
        const errorMessage = await res.text().catch(() => "Failed to upload paper");
        throw new Error(errorMessage || "Failed to upload paper");
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
                  if (!data.file) {
                    toast({
                      title: "Please select a file",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  uploadMutation.mutate(data);
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

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Paper File (PDF)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            // this handles the file input change
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
