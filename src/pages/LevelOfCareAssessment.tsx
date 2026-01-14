import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Form schema
const levelOfCareSchema = z.object({
  // Section I - Administrative Data
  operatingCertNumber: z.string().optional(),
  ssn: z.string().optional(),
  facilityName: z.string().optional(),
  patientName: z.string().optional(),
  countyOfResidence: z.string().optional(),
  medicalRecordNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sex: z.string().optional(),
  medicaidNumber: z.string().optional(),
  medicareNumber: z.string().optional(),
  primaryPayor: z.string().optional(),

  // Section II - ADLs
  livingArrangement: z.string().optional(),
  assistiveEquipment: z.string().optional(),
  medicationAdherence: z.string().optional(),

  // Section III - Medical Events
  decubitusLevel: z.string().optional(),
  comatose: z.boolean().optional(),
  dehydration: z.boolean().optional(),
  internalBleeding: z.boolean().optional(),
  stasisUlcer: z.boolean().optional(),
  terminallyIll: z.boolean().optional(),
  contractures: z.boolean().optional(),
  diabetesMellitus: z.boolean().optional(),
  urinaryTractInfection: z.boolean().optional(),
  hivSymptomatic: z.boolean().optional(),
  accident: z.boolean().optional(),
  ventilatorDependent: z.boolean().optional(),
  physicalRestraints: z.boolean().optional(),
  
  tracheostomyCare: z.string().optional(),
  suctioningGeneral: z.string().optional(),
  oxygen: z.string().optional(),
  respiratoryCare: z.string().optional(),
  nasogastricFeeding: z.string().optional(),
  parenteralFeeding: z.string().optional(),
  woundCare: z.string().optional(),
  chemotherapy: z.string().optional(),
  transfusion: z.string().optional(),
  dialysis: z.string().optional(),
  bowelBladderRehab: z.string().optional(),
  catheter: z.string().optional(),

  // Section IV - Behaviors
  verbalDisruption: z.boolean().optional(),
  physicalAggression: z.boolean().optional(),
  disruptiveBehavior: z.boolean().optional(),
  hallucinations: z.boolean().optional(),

  // Section V - Specialized Services
  ptLevel: z.string().optional(),
  ptDays: z.string().optional(),
  ptTime: z.string().optional(),
  otLevel: z.string().optional(),
  otDays: z.string().optional(),
  otTime: z.string().optional(),
  physicianVisits: z.string().optional(),

  // Section VI - Diagnosis
  primaryProblemIcd: z.string().optional(),
  primaryProblemDescription: z.string().optional(),

  // Section VII - Plan of Care
  diagnosesPrognoses: z.string().optional(),
  rehabilitationPotential: z.string().optional(),
  therapyCarePlan: z.string().optional(),
  medications: z.string().optional(),
  treatments: z.string().optional(),
  narrative: z.string().optional(),
  raceEthnicGroup: z.string().optional(),
  assessorSignature: z.string().optional(),
  assessorId: z.string().optional(),
});

type FormValues = z.infer<typeof levelOfCareSchema>;

export default function LevelOfCareAssessment() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-fill data for Robert Jenkins (patient ID 7)
  const getDefaultValues = (): Partial<FormValues> => {
    if (patientId === "7") {
      return {
        operatingCertNumber: "NYC-2024-1234",
        ssn: "487-92-5361",
        facilityName: "Metropolitan Health Center",
        patientName: "Robert Jenkins, 742 Evergreen Terrace, Springfield",
        countyOfResidence: "Kings County",
        medicalRecordNumber: "MRN-2024-007",
        dateOfBirth: "1945-03-15",
        sex: "male",
        medicaidNumber: "MC-NY-789456123",
        medicareNumber: "1AB-CD-EF23-G45",
        primaryPayor: "medicaid",
      };
    }
    return {};
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(levelOfCareSchema),
    defaultValues: getDefaultValues(),
  });

  const onSaveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your progress has been saved.",
    });
  };

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    toast({
      title: "Form Submitted",
      description: "Level of Care Assessment has been submitted successfully.",
    });
  };

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/patient/${patientId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patient Case
        </Button>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Level of Care Assessment</h1>
          <p className="text-muted-foreground">UAS-NY DOH-694B</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="admin-adls" className="space-y-4">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="admin-adls">I. Admin & ADLs</TabsTrigger>
                <TabsTrigger value="medical">II. Medical</TabsTrigger>
                <TabsTrigger value="behaviors">III. Behaviors</TabsTrigger>
                <TabsTrigger value="services">IV. Services</TabsTrigger>
                <TabsTrigger value="diagnosis">V. Diagnosis</TabsTrigger>
                <TabsTrigger value="plan">VI. Plan</TabsTrigger>
              </TabsList>

              {/* Section I - Administrative Data */}
              {/* Section I - Administrative Data & ADLs */}
              <TabsContent value="admin-adls">
                <Card>
                  <CardHeader>
                    <CardTitle>I. Administrative Data & Activities of Daily Living</CardTitle>
                    <CardDescription>Patient information and daily living capabilities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Administrative Data</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="operatingCertNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operating Certificate Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ssn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Social Security Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="facilityName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Official Name of Hospital or Other Agency/Facility</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patient Name & Community Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="countyOfResidence"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>County of Residence</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medicalRecordNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medical Record Number / Case Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="primaryPayor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Payor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="medicaid">Medicaid</SelectItem>
                                    <SelectItem value="medicare">Medicare</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="medicaidNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medicaid Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="medicareNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medicare Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Activities of Daily Living (ADLs)</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="livingArrangement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Do you live alone or with someone?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value}>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="alone" id="alone" />
                                    <Label htmlFor="alone">Alone</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="with-someone" id="with-someone" />
                                    <Label htmlFor="with-someone">With someone</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="assistiveEquipment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Do you use any equipment like a cane or walker?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value}>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="equipment-yes" />
                                    <Label htmlFor="equipment-yes">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="equipment-no" />
                                    <Label htmlFor="equipment-no">No</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="medicationAdherence"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Do you ever forget to take your medications?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value}>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="never" id="med-never" />
                                    <Label htmlFor="med-never">Never</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="sometimes" id="med-sometimes" />
                                    <Label htmlFor="med-sometimes">Sometimes</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="often" id="med-often" />
                                    <Label htmlFor="med-often">Often</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section II - Medical Events */}
              <TabsContent value="medical">
                <Card>
                  <CardHeader>
                    <CardTitle>II. Medical Events</CardTitle>
                    <CardDescription>Medical conditions and treatments during the past week</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="decubitusLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Decubitus Level (most severe)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Level 0 - None</SelectItem>
                              <SelectItem value="1">Level 1</SelectItem>
                              <SelectItem value="2">Level 2</SelectItem>
                              <SelectItem value="3">Level 3</SelectItem>
                              <SelectItem value="4">Level 4</SelectItem>
                              <SelectItem value="5">Level 5</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="text-base font-semibold mb-3 block">Medical Conditions</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "comatose", label: "Comatose" },
                          { name: "dehydration", label: "Dehydration" },
                          { name: "internalBleeding", label: "Internal Bleeding" },
                          { name: "stasisUlcer", label: "Stasis Ulcer" },
                          { name: "terminallyIll", label: "Terminally Ill" },
                          { name: "contractures", label: "Contractures" },
                          { name: "diabetesMellitus", label: "Diabetes Mellitus" },
                          { name: "urinaryTractInfection", label: "Urinary Tract Infection" },
                          { name: "hivSymptomatic", label: "HIV Infection Symptomatic" },
                          { name: "accident", label: "Accident" },
                          { name: "ventilatorDependent", label: "Ventilator Dependent" },
                          { name: "physicalRestraints", label: "Physical Restraints (daytime only)" },
                        ].map((condition) => (
                          <FormField
                            key={condition.name}
                            control={form.control}
                            name={condition.name as any}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {condition.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-3 block">Medical Treatments (1 = Yes, 2 = No)</Label>
                      <div className="space-y-3">
                        {[
                          { name: "tracheostomyCare", label: "Tracheostomy care/suctioning" },
                          { name: "suctioningGeneral", label: "Suctioning - general" },
                          { name: "oxygen", label: "Oxygen" },
                          { name: "respiratoryCare", label: "Respiratory care" },
                          { name: "nasogastricFeeding", label: "Nasogastric feeding" },
                          { name: "parenteralFeeding", label: "Parenteral feeding" },
                          { name: "woundCare", label: "Wound care" },
                          { name: "chemotherapy", label: "Chemotherapy" },
                          { name: "transfusion", label: "Transfusion" },
                          { name: "dialysis", label: "Dialysis" },
                          { name: "bowelBladderRehab", label: "Bowel/bladder rehabilitation" },
                          { name: "catheter", label: "Catheter (indwelling or external)" },
                        ].map((treatment) => (
                          <FormField
                            key={treatment.name}
                            control={form.control}
                            name={treatment.name as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{treatment.label}</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="1" id={`${treatment.name}-yes`} />
                                      <Label htmlFor={`${treatment.name}-yes`}>Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="2" id={`${treatment.name}-no`} />
                                      <Label htmlFor={`${treatment.name}-no`}>No</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section III - Behaviors */}
              <TabsContent value="behaviors">
                <Card>
                  <CardHeader>
                    <CardTitle>III. Behaviors</CardTitle>
                    <CardDescription>Behavioral observations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "verbalDisruption", label: "Verbal disruption (yelling, threatening, etc.)" },
                        { name: "physicalAggression", label: "Physical aggression (assaultive or combative)" },
                        { name: "disruptiveBehavior", label: "Disruptive / infantile / socially inappropriate behavior" },
                        { name: "hallucinations", label: "Hallucinations (visual, auditory, tactile)" },
                      ].map((behavior) => (
                        <FormField
                          key={behavior.name}
                          control={form.control}
                          name={behavior.name as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {behavior.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section IV - Specialized Services */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>IV. Specialized Services</CardTitle>
                    <CardDescription>Physical & occupational therapies and physician visits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Physical Therapy</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="ptLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Level</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Standard" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ptDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days per week</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ptTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time (hours/minutes)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 1h 30m" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-3 block">Occupational Therapy</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="otLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Level</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Standard" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="otDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Days per week</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="otTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time (hours/minutes)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., 1h 30m" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="physicianVisits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Physician Visits (past week)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section V - Diagnosis */}
              <TabsContent value="diagnosis">
                <Card>
                  <CardHeader>
                    <CardTitle>V. Diagnosis</CardTitle>
                    <CardDescription>Primary problem and medical description</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="primaryProblemIcd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Problem - ICD Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., J44.1" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryProblemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe the primary medical problem" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Section VI - Plan of Care Summary */}
              <TabsContent value="plan">
                <Card>
                  <CardHeader>
                    <CardTitle>VI. Plan of Care Summary</CardTitle>
                    <CardDescription>Comprehensive care plan and assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="diagnosesPrognoses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnoses and Prognoses</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Include care plan implications" rows={4} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rehabilitationPotential"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rehabilitation Potential - Expected ADL improvement in 6 months</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="therapyCarePlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Therapy Care Plan - Treatments, rationale, and equipment</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medications - Name, dose, frequency, route, diagnosis</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="List all current medications" rows={4} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="treatments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatments - Wound care, oxygen, etc., with frequency</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="narrative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Narrative - Special diet, allergies, lab values, pacemaker, etc.</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="raceEthnicGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Race / Ethnic Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select race/ethnic group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 - White</SelectItem>
                              <SelectItem value="2">2 - Black or African American</SelectItem>
                              <SelectItem value="3">3 - American Indian or Alaska Native</SelectItem>
                              <SelectItem value="4">4 - Asian</SelectItem>
                              <SelectItem value="5">5 - Native Hawaiian or Other Pacific Islander</SelectItem>
                              <SelectItem value="6">6 - Hispanic or Latino</SelectItem>
                              <SelectItem value="7">7 - Two or More Races</SelectItem>
                              <SelectItem value="8">8 - Other</SelectItem>
                              <SelectItem value="9">9 - Unknown/Declined</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="assessorSignature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualified Assessor Signature</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assessorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessor ID Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={onSaveDraft}>
                Save Draft
              </Button>
              <Button type="submit">Submit Assessment</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
