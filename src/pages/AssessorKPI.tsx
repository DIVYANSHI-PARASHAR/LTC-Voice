import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Clock, Users, Target, TrendingUp, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";

const timeToCompletionData = [
  { date: "Week 1", avgDays: 24 },
  { date: "Week 2", avgDays: 22 },
  { date: "Week 3", avgDays: 20 },
  { date: "Week 4", avgDays: 18 },
  { date: "Week 5", avgDays: 21 },
  { date: "Week 6", avgDays: 19 },
];

const assessorVolumeData = [
  { name: "Sarah Mitchell", completed: 45 },
  { name: "John Davis", completed: 38 },
  { name: "Emily Chen", completed: 42 },
  { name: "Michael Brown", completed: 35 },
  { name: "Lisa Johnson", completed: 40 },
];

const completionRateData = [
  { region: "Manhattan", rate: 92 },
  { region: "Brooklyn", rate: 88 },
  { region: "Queens", rate: 85 },
  { region: "Bronx", rate: 90 },
  { region: "Staten Island", rate: 94 },
];

const reassessmentData = [
  { name: "On Time", value: 78 },
  { name: "Overdue", value: 22 },
];

const errorRateData = [
  { month: "Jan", errorRate: 8 },
  { month: "Feb", errorRate: 6 },
  { month: "Mar", errorRate: 5 },
  { month: "Apr", errorRate: 4 },
  { month: "May", errorRate: 5 },
  { month: "Jun", errorRate: 3 },
];

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

const kpiCards = [
  {
    title: "Avg Time to Completion",
    value: "19.5 days",
    change: "-2.3 days",
    trend: "down",
    icon: Clock,
    color: "text-blue-600",
  },
  {
    title: "Assessment Volume",
    value: "200",
    change: "+12% this month",
    trend: "up",
    icon: Users,
    color: "text-green-600",
  },
  {
    title: "Completion Rate",
    value: "89.8%",
    change: "+3.2%",
    trend: "up",
    icon: Target,
    color: "text-purple-600",
  },
  {
    title: "Error Rate",
    value: "3.2%",
    change: "-1.5%",
    trend: "down",
    icon: AlertCircle,
    color: "text-orange-600",
  },
  {
    title: "Median Days: Referral→Enrollment",
    value: "28 days",
    change: "-4 days",
    trend: "down",
    icon: TrendingUp,
    color: "text-indigo-600",
  },
  {
    title: "Reassessment Timeliness",
    value: "78%",
    change: "+5%",
    trend: "up",
    icon: Calendar,
    color: "text-teal-600",
  },
];

export default function AssessorKPI() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Assessor KPI Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              UnitedHealthcare Community Plan of New York, Inc.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.trend === "up" ? kpi.title.includes("Rate") || kpi.title.includes("Volume") || kpi.title.includes("Timeliness") : kpi.trend === "down";
            
            return (
              <Card key={kpi.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                      <Badge variant={isPositive ? "default" : "secondary"} className="gap-1">
                        {kpi.change}
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-lg bg-muted`}>
                      <Icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Time to Completion Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Average Time to Completion Over Time</CardTitle>
                <CardDescription>
                  Measures how long assessors take from Started to Completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeToCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgDays"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Avg Days"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Completion Rate by Region */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Region</CardTitle>
                <CardDescription>
                  Percentage of assessments finalized within 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionRateData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="region" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" name="Completion Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            {/* Assessment Volume by Assessor */}
            <Card>
              <CardHeader>
                <CardTitle>Assessments Completed per Assessor</CardTitle>
                <CardDescription>
                  Total completed intakes by each assessor this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={assessorVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Assessor Utilization */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Caseload</CardTitle>
                  <CardDescription>Current active cases per assessor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assessorVolumeData.map((assessor, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{assessor.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(assessor.completed / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {Math.floor((assessor.completed / 50) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Assessment volume over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">January</span>
                    <span className="text-sm font-medium">182 assessments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">February</span>
                    <span className="text-sm font-medium">175 assessments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">March</span>
                    <span className="text-sm font-medium">195 assessments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">April</span>
                    <span className="text-sm font-medium">188 assessments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">May</span>
                    <span className="text-sm font-medium">203 assessments</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">June (Current)</span>
                    <Badge>200 assessments</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Error Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Error Rate / Form Revisions</CardTitle>
                <CardDescription>
                  Number of assessments returned for correction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={errorRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="errorRate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Error Rate %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reassessment Compliance */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reassessment Timeliness</CardTitle>
                  <CardDescription>
                    6-month reassessments completed on schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={reassessmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reassessmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics Summary</CardTitle>
                  <CardDescription>Current month performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm">First-Time Approval Rate</span>
                    </div>
                    <Badge variant="default">96.8%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span className="text-sm">Corrections Required</span>
                    </div>
                    <Badge variant="secondary">3.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm">Avg. Review Time</span>
                    </div>
                    <Badge variant="outline">2.3 days</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="text-sm">Quality Score</span>
                    </div>
                    <Badge>4.7/5.0</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
