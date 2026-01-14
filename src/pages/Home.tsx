import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ClipboardList, 
  Building2, 
  CreditCard, 
  HeartPulse,
  Phone,
  Mail,
  Plus,
  Clock,
  Bot,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { workflowPatients, type WorkflowStatus } from "@/data/workflowPatients";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Total Cases", value: "124", icon: FolderOpen, color: "text-primary" },
  { label: "Avg. Time to Complete", value: "57 min", icon: Clock, color: "text-blue-600" },
  { label: "VoiceAI Automation Rate", value: "82%", icon: Bot, color: "text-purple-600" },
  { label: "On-Time Submissions", value: "91%", icon: CheckCircle2, color: "text-success" },
];


export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all patients from all workflows
  const allPatients = workflowPatients.flatMap(workflow => 
    workflow.patients.map(patient => ({
      ...patient,
      workflowName: workflow.name,
      workflowId: workflow.id
    }))
  );

  // Filter patients based on search query
  const filteredPatients = allPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInitiateRemoteAssessment = (patientId: string, patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Initiating remote assessment for ${patientName}`);
  };

  const handleScheduleInPersonAssessment = (patientId: string, patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Calling to schedule in-person assessment for ${patientName}`);
    // In a real app, this would open a scheduling dialog
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome back, John Williams 👋
          </h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="outline">Case Manager – NY Medicaid LTC</Badge>
            <span>•</span>
            <span className="text-sm">Last Login: Oct 25, 2025, 9:32 AM</span>
          </div>
        </div>

        {/* Workflow Status Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Roster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Search and List */}
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search patient by name..."
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Patient List - Always Visible */}
              <div className="border rounded-lg divide-y max-h-[600px] overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      {/* Left side - Patient info (clickable) */}
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.caseId} • Age {patient.age}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right side - Status, days, actions */}
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{patient.status}</Badge>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {patient.daysInWorkflow} days
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No patients found
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Two-Column Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* System Summary */}
          <Card>
            <CardHeader>
              <CardTitle>System Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active Cases:</span>
                <span className="text-2xl font-bold text-primary">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending Reviews:</span>
                <span className="text-2xl font-bold text-warning">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completed Today:</span>
                <span className="text-2xl font-bold text-success">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Completion Time:</span>
                <span className="text-2xl font-bold text-foreground">54 min</span>
              </div>
            </CardContent>
          </Card>

          {/* User Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cases This Week:</span>
                <span className="text-2xl font-bold text-foreground">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg. Response Time:</span>
                <span className="text-2xl font-bold text-foreground">42 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">On-Time Rate:</span>
                <span className="text-2xl font-bold text-success">91%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quality Score:</span>
                <span className="text-2xl font-bold text-success">4.8/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Overall Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Medicaid Placement System • Built for New York LTC / HCBS Workflows
          </p>
        </div>
      </footer>
    </div>
  );
}
