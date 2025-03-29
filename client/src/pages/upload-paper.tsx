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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useState } from "react";
import { Loader2, FileCheck, CheckCircle, AlertCircle, Languages, 
         TextSelect, CircleCheck, FileWarning } from "lucide-react";
import { checkGrammar, type GrammarCheckResult } from "@/lib/grammar-service";
import { checkResearchPaperFormat, type FormatCheckResult } from "@/lib/format-checker";

export default function UploadPaper() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarCheckResult | null>(null);
  const [formatResult, setFormatResult] = useState<FormatCheckResult | null>(null);
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [extractedText, setExtractedText] = useState("");

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

  const checkPaperMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsChecking(true);
      const formData = new FormData();
      formData.append("file", file);

      // Extract text from the PDF on the server
      const res = await fetch("/api/papers/check-grammar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to check paper");
      }

      const data = await res.json();
      setExtractedText(data.text || "");
      
      // Perform client-side grammar check
      const grammarCheckResult = checkGrammar(data.text || "");
      setGrammarResult(grammarCheckResult);
      
      // Perform client-side format check
      const formatCheckResult = checkResearchPaperFormat(data.text || "");
      setFormatResult(formatCheckResult);
      
      setCheckDialogOpen(true);
      return { grammar: grammarCheckResult, format: formatCheckResult };
    },
    onError: (error: Error) => {
      setIsChecking(false);
      toast({
        title: "Check failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setIsChecking(false);
    }
  });

  function checkPaper() {
    const file = form.getValues().file;
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }
    checkPaperMutation.mutate(file);
  }

  function renderGrammarErrors() {
    if (!grammarResult) return null;
    
    const errors = grammarResult.errors.slice(0, 5); // Show only first 5 errors
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Grammar Score</h3>
          <span className={`px-2 py-1 rounded text-xs ${
            grammarResult.score > 80 ? "bg-green-100 text-green-800" : 
            grammarResult.score > 60 ? "bg-yellow-100 text-yellow-800" : 
            "bg-red-100 text-red-800"
          }`}>
            {grammarResult.score}/100
          </span>
        </div>
        
        <Progress value={grammarResult.score} className="h-2" />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Key Issues</h4>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="text-xs bg-muted p-2 rounded">
                <div className="flex items-start">
                  <span className={`mr-2 ${
                    error.severity === 'error' ? "text-red-500" : 
                    error.severity === 'warning' ? "text-yellow-500" : 
                    "text-blue-500"
                  }`}>
                    {error.severity === 'error' ? <AlertCircle size={14} /> : 
                     error.severity === 'warning' ? <FileWarning size={14} /> : 
                     <TextSelect size={14} />}
                  </span>
                  <div>
                    <p className="font-medium">{error.message}</p>
                    {error.suggestion && <p className="text-muted-foreground">Suggestion: {error.suggestion}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {grammarResult.errors.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              + {grammarResult.errors.length - 5} more issues
            </p>
          )}
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Statistics</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Word Count</p>
              <p className="font-bold">{grammarResult.totalWords}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Passive Voice</p>
              <p className="font-bold">{grammarResult.passiveCount}</p>
            </div>
            <div className="bg-muted p-2 rounded">
              <p className="text-muted-foreground">Issues</p>
              <p className="font-bold">{grammarResult.errors.length}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderFormatResults() {
    if (!formatResult) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Format Score</h3>
          <span className={`px-2 py-1 rounded text-xs ${
            formatResult.formatScore > 80 ? "bg-green-100 text-green-800" : 
            formatResult.formatScore > 60 ? "bg-yellow-100 text-yellow-800" : 
            "bg-red-100 text-red-800"
          }`}>
            {formatResult.formatScore}/100
          </span>
        </div>
        
        <Progress value={formatResult.formatScore} className="h-2" />
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Section Check</h4>
          <ul className="space-y-1 text-xs">
            {formatResult.missingRequiredSections.length > 0 ? (
              formatResult.missingRequiredSections.map((section, i) => (
                <li key={i} className="flex items-center text-red-500">
                  <AlertCircle size={12} className="mr-1" />
                  <span>Missing required section: {section}</span>
                </li>
              ))
            ) : (
              <li className="flex items-center text-green-500">
                <CheckCircle size={12} className="mr-1" />
                <span>All required sections found</span>
              </li>
            )}
          </ul>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Detected Sections</h4>
          <div className="flex flex-wrap gap-1">
            {formatResult.detectedSections.map((section, i) => (
              <span key={i} className="text-xs bg-primary/10 px-2 py-1 rounded">
                {section}
              </span>
            ))}
          </div>
        </div>
        
        {formatResult.suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Suggestions</h4>
            <ul className="space-y-1 text-xs">
              {formatResult.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-500 mr-1 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Upload Research Paper</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
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
                                  // Reset previous check results when a new file is uploaded
                                  setGrammarResult(null);
                                  setFormatResult(null);
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

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={checkPaper}
                        disabled={isChecking || !form.getValues().file}
                      >
                        {isChecking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Check Paper Format & Grammar
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={uploadMutation.isLoading}
                      >
                        {uploadMutation.isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Paper"
                        )}
                      </Button>
                    </div>

                    {/* Grammar and Format Check Dialog */}
                    <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Paper Analysis Results</DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="grammar" className="mt-4">
                          <TabsList className="w-full">
                            <TabsTrigger value="grammar" className="flex-1">
                              <Languages className="mr-2 h-4 w-4" />
                              Grammar & Language
                            </TabsTrigger>
                            <TabsTrigger value="format" className="flex-1">
                              <FileCheck className="mr-2 h-4 w-4" />
                              Paper Format
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="flex-1">
                              <TextSelect className="mr-2 h-4 w-4" />
                              Text Preview
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="grammar" className="mt-4">
                            {renderGrammarErrors()}
                          </TabsContent>
                          
                          <TabsContent value="format" className="mt-4">
                            {renderFormatResults()}
                          </TabsContent>
                          
                          <TabsContent value="preview" className="mt-4">
                            <div className="h-64 overflow-y-auto bg-muted p-3 rounded text-xs font-mono">
                              {extractedText || "No text extracted from the document"}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <DialogFooter className="mt-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-1">
                              <CircleCheck className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-muted-foreground">Improving your paper before submission increases approval chances</span>
                            </div>
                            <Button onClick={() => setCheckDialogOpen(false)}>Close</Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Paper Check Features</CardTitle>
                <CardDescription>Verify your paper before submission</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Grammar Analysis</p>
                      <p className="text-xs text-muted-foreground">Identify common grammar issues, passive voice usage, and writing clarity problems</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Format Verification</p>
                      <p className="text-xs text-muted-foreground">Ensure your paper includes all required sections and follows proper academic structure</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Citation Style Detection</p>
                      <p className="text-xs text-muted-foreground">Recognize your citation style and provide consistency recommendations</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Word Count Analysis</p>
                      <p className="text-xs text-muted-foreground">Check if your paper meets length requirements for academic standards</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Click "Check Paper Format & Grammar" after uploading your PDF to access these features
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
