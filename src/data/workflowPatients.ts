export interface Patient {
  id: string;
  name: string;
  age: number;
  caseId: string;
  status: string;
  daysInWorkflow: number;
}

export interface WorkflowStatus {
  id: string;
  name: string;
  subtitle: string;
  route: string;
  patientCount: number;
  patients: Patient[];
}

export const workflowPatients: WorkflowStatus[] = [
  {
    id: "workflow-a",
    name: "Eligibility Checks",
    subtitle: "Workflow A",
    route: "/eligibility-checks",
    patientCount: 8,
    patients: [
      {
        id: "6",
        name: "Linda Martinez",
        age: 71,
        caseId: "NY-MC-2024-1239",
        status: "Remote Intake",
        daysInWorkflow: 3,
      },
      {
        id: "7",
        name: "Robert Jenkins",
        age: 73,
        caseId: "NY-MC-2024-1240",
        status: "Remote Intake",
        daysInWorkflow: 2,
      },
      {
        id: "8",
        name: "Barbara Rodriguez",
        age: 67,
        caseId: "NY-MC-2024-1241",
        status: "Authorization",
        daysInWorkflow: 6,
      },
      {
        id: "9",
        name: "Richard Moore",
        age: 74,
        caseId: "NY-MC-2024-1242",
        status: "Remote Intake",
        daysInWorkflow: 1,
      },
      {
        id: "10",
        name: "Susan Taylor",
        age: 69,
        caseId: "NY-MC-2024-1243",
        status: "Referral",
        daysInWorkflow: 4,
      },
      {
        id: "11",
        name: "Joseph Anderson",
        age: 72,
        caseId: "NY-MC-2024-1244",
        status: "Remote Intake",
        daysInWorkflow: 2,
      },
      {
        id: "12",
        name: "Nancy Thomas",
        age: 70,
        caseId: "NY-MC-2024-1245",
        status: "Nurse Assessment",
        daysInWorkflow: 3,
      },
      {
        id: "13",
        name: "Charles Jackson",
        age: 68,
        caseId: "NY-MC-2024-1246",
        status: "Authorization",
        daysInWorkflow: 1,
      },
    ],
  },
];
