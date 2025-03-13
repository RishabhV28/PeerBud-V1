import { Card, CardContent } from "@/components/ui/card";

const INSTITUTES = [
  {
    name: "Indian Institute of Technology, Delhi",
    abbreviation: "IIT Delhi",
    color: "bg-blue-100",
  },
  {
    name: "Indian Institute of Technology, Bombay",
    abbreviation: "IIT Bombay",
    color: "bg-red-100",
  },
  {
    name: "Indian Institute of Management, Ahmedabad",
    abbreviation: "IIM-A",
    color: "bg-green-100",
  },
  {
    name: "Indian Institute of Science, Bangalore",
    abbreviation: "IISc",
    color: "bg-yellow-100",
  },
  {
    name: "Indian Institute of Technology, Madras",
    abbreviation: "IIT Madras",
    color: "bg-purple-100",
  },
  {
    name: "Indian Institute of Management, Bangalore",
    abbreviation: "IIM-B",
    color: "bg-orange-100",
  },
] as const;

export function InstitutesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {INSTITUTES.map((institute) => (
        <Card key={institute.abbreviation}>
          <CardContent className={`p-6 ${institute.color} rounded-lg`}>
            <div className="text-2xl font-bold mb-2">{institute.abbreviation}</div>
            <div className="text-sm text-muted-foreground">{institute.name}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
