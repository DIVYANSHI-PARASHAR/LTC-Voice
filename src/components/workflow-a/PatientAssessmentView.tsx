/**
 * Patient Assessment View Component
 * 
 * Displays comprehensive patient assessment data collected from VAPI calls
 * including ADLs, IADLs, health status, cognition, and support network
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompleteAssessment } from '@/integrations/supabase/hooks/use-assessments';
import { 
  Home, 
  User, 
  Activity, 
  Heart, 
  Brain, 
  Users,
  AlertCircle,
  CheckCircle,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';

interface PatientAssessmentViewProps {
  assessmentId: string;
}

export function PatientAssessmentView({ assessmentId }: PatientAssessmentViewProps) {
  const { data, isLoading, error } = useCompleteAssessment(assessmentId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading assessment: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No assessment data found</AlertDescription>
      </Alert>
    );
  }

  const { assessment, livingSituation, adlAssessment, iadlAssessment, healthAssessment, cognitionAssessment, supportNetwork } = (data as any);

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Assessment
              </CardTitle>
              <CardDescription>
                Completed on {new Date(assessment.assessment_date || '').toLocaleDateString()} by {assessment.assessed_by}
              </CardDescription>
            </div>
            <Badge variant={assessment.assessment_complete ? 'default' : 'secondary'}>
              {assessment.assessment_complete ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Incomplete
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        {assessment.verbal_summary && (
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Summary Provided to Patient:</p>
              <p className="text-sm text-muted-foreground">{assessment.verbal_summary}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="living" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="living">
            <Home className="h-4 w-4 mr-2" />
            Living
          </TabsTrigger>
          <TabsTrigger value="adl">
            <User className="h-4 w-4 mr-2" />
            ADLs
          </TabsTrigger>
          <TabsTrigger value="iadl">
            <Activity className="h-4 w-4 mr-2" />
            IADLs
          </TabsTrigger>
          <TabsTrigger value="health">
            <Heart className="h-4 w-4 mr-2" />
            Health
          </TabsTrigger>
          <TabsTrigger value="cognition">
            <Brain className="h-4 w-4 mr-2" />
            Cognition
          </TabsTrigger>
          <TabsTrigger value="support">
            <Users className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* Living Situation Tab */}
        <TabsContent value="living">
          <Card>
            <CardHeader>
              <CardTitle>Living Situation</CardTitle>
              <CardDescription>Home environment and accessibility</CardDescription>
            </CardHeader>
            <CardContent>
              {livingSituation ? (
                <div className="space-y-4">
                  <InfoRow label="Lives Alone" value={livingSituation.lives_alone} />
                  {!livingSituation.lives_alone && (
                    <>
                      <InfoRow label="Lives With" value={livingSituation.lives_with} />
                      <InfoRow label="Details" value={livingSituation.lives_with_details} />
                    </>
                  )}
                  <InfoRow label="Housing Type" value={livingSituation.housing_type} />
                  <InfoRow label="Stairs to Enter" value={livingSituation.has_stairs_to_enter} />
                  <InfoRow label="Stairs Inside Home" value={livingSituation.stairs_inside_home} />
                  <InfoRow label="Has Elevator" value={livingSituation.has_elevator} />
                  <InfoRow label="Wheelchair Accessible" value={livingSituation.wheelchair_accessible} />
                  {livingSituation.home_safety_concerns && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Safety Concerns:</strong> {livingSituation.home_safety_concerns}
                      </AlertDescription>
                    </Alert>
                  )}
                  {livingSituation.additional_notes && (
                    <InfoRow label="Additional Notes" value={livingSituation.additional_notes} />
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No living situation data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADL Assessment Tab */}
        <TabsContent value="adl">
          <Card>
            <CardHeader>
              <CardTitle>Activities of Daily Living (ADLs)</CardTitle>
              <CardDescription>Basic self-care activities</CardDescription>
            </CardHeader>
            <CardContent>
              {adlAssessment ? (
                <div className="space-y-6">
                  <ADLSection
                    title="Bathing"
                    independent={adlAssessment.bathing_independent}
                    level={adlAssessment.bathing_level}
                    notes={adlAssessment.bathing_notes}
                  />
                  <ADLSection
                    title="Dressing"
                    independent={adlAssessment.dressing_independent}
                    level={adlAssessment.dressing_level}
                    notes={adlAssessment.dressing_notes}
                  />
                  <ADLSection
                    title="Toileting"
                    independent={adlAssessment.toileting_independent}
                    level={adlAssessment.toileting_level}
                    notes={adlAssessment.toileting_notes}
                    extra={adlAssessment.toileting_incontinence ? 'Incontinence issues' : undefined}
                  />
                  <ADLSection
                    title="Eating"
                    independent={adlAssessment.eating_independent}
                    level={adlAssessment.eating_level}
                    notes={adlAssessment.eating_notes}
                    extra={adlAssessment.eating_special_diet ? `Special diet: ${adlAssessment.eating_special_diet}` : undefined}
                  />
                  <ADLSection
                    title="Transferring"
                    independent={adlAssessment.transferring_independent}
                    level={adlAssessment.transferring_level}
                    notes={adlAssessment.transferring_notes}
                  />
                  <ADLSection
                    title="Mobility"
                    independent={adlAssessment.mobility_independent}
                    level={adlAssessment.mobility_level}
                    notes={adlAssessment.mobility_notes}
                  />
                  {adlAssessment.uses_assistive_device && adlAssessment.assistive_devices && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Assistive Devices:</strong> {adlAssessment.assistive_devices.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No ADL assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IADL Assessment Tab */}
        <TabsContent value="iadl">
          <Card>
            <CardHeader>
              <CardTitle>Instrumental Activities of Daily Living (IADLs)</CardTitle>
              <CardDescription>Complex activities required for independent living</CardDescription>
            </CardHeader>
            <CardContent>
              {iadlAssessment ? (
                <div className="space-y-6">
                  {/* Medication Management - HIGHLIGHTED as critical */}
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Medication Management (Critical)
                    </h4>
                    <div className="space-y-2">
                      <InfoRow label="Independent" value={iadlAssessment.medication_management_independent} />
                      <InfoRow 
                        label="Forgets Medications" 
                        value={iadlAssessment.forgets_medications}
                        highlight={iadlAssessment.forgets_medications === true}
                      />
                      <InfoRow 
                        label="Needs Reminders" 
                        value={iadlAssessment.medication_reminders_needed}
                        highlight={iadlAssessment.medication_reminders_needed === true}
                      />
                      {iadlAssessment.medication_notes && (
                        <div className="mt-2 p-2 bg-muted rounded">
                          <p className="text-sm"><strong>Notes:</strong> {iadlAssessment.medication_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <IADLSection
                    title="Meal Preparation"
                    independent={iadlAssessment.meal_prep_independent}
                    level={iadlAssessment.meal_prep_level}
                    notes={iadlAssessment.meal_prep_notes}
                  />
                  <IADLSection
                    title="Laundry"
                    independent={iadlAssessment.laundry_independent}
                    level={iadlAssessment.laundry_level}
                    notes={iadlAssessment.laundry_notes}
                  />
                  <IADLSection
                    title="Shopping"
                    independent={iadlAssessment.shopping_independent}
                    level={iadlAssessment.shopping_level}
                    notes={iadlAssessment.shopping_notes}
                  />
                  <IADLSection
                    title="Money Management"
                    independent={iadlAssessment.money_management_independent}
                    level={iadlAssessment.money_management_level}
                    notes={iadlAssessment.money_management_notes}
                  />
                  <IADLSection
                    title="Transportation"
                    independent={iadlAssessment.transportation_independent}
                    level={iadlAssessment.transportation_method}
                    notes={iadlAssessment.transportation_notes}
                  />
                  <IADLSection
                    title="Housekeeping"
                    independent={iadlAssessment.housekeeping_independent}
                    level={iadlAssessment.housekeeping_level}
                    notes={iadlAssessment.housekeeping_notes}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No IADL assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Assessment Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health Assessment</CardTitle>
              <CardDescription>Medical conditions and symptoms</CardDescription>
            </CardHeader>
            <CardContent>
              {healthAssessment ? (
                <div className="space-y-4">
                  {healthAssessment.chronic_conditions && healthAssessment.chronic_conditions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Chronic Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {healthAssessment.chronic_conditions.map((condition) => (
                          <Badge key={condition} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                      {healthAssessment.chronic_conditions_details && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {healthAssessment.chronic_conditions_details}
                        </p>
                      )}
                    </div>
                  )}

                  {healthAssessment.has_pain && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Pain:</strong> Level {healthAssessment.pain_level}/10
                        {healthAssessment.pain_location && ` in ${healthAssessment.pain_location}`}
                        {healthAssessment.pain_frequency && ` (${healthAssessment.pain_frequency})`}
                      </AlertDescription>
                    </Alert>
                  )}

                  <InfoRow label="Breathing Issues" value={healthAssessment.has_breathing_issues} />
                  {healthAssessment.uses_oxygen && (
                    <Badge variant="secondary">Uses Oxygen</Badge>
                  )}

                  <InfoRow label="Dizziness" value={healthAssessment.has_dizziness} />
                  <InfoRow label="Balance Issues" value={healthAssessment.has_balance_issues} />
                  <InfoRow label="Fall Risk" value={healthAssessment.fall_risk} />
                  
                  {healthAssessment.has_wounds && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Wound Care</h4>
                      <InfoRow label="Location" value={healthAssessment.wound_location} />
                      <InfoRow label="Type" value={healthAssessment.wound_type} />
                      <InfoRow label="Care Needed" value={healthAssessment.wound_care_needed} />
                    </div>
                  )}

                  <InfoRow label="Vision Impairment" value={healthAssessment.vision_impairment} />
                  <InfoRow label="Hearing Impairment" value={healthAssessment.hearing_impairment} />
                  {healthAssessment.uses_hearing_aid && (
                    <Badge variant="secondary">Uses Hearing Aid</Badge>
                  )}

                  {healthAssessment.additional_health_concerns && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Additional Concerns:</strong> {healthAssessment.additional_health_concerns}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No health assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognition Assessment Tab */}
        <TabsContent value="cognition">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Assessment</CardTitle>
              <CardDescription>Memory, orientation, and mental status</CardDescription>
            </CardHeader>
            <CardContent>
              {cognitionAssessment ? (
                <div className="space-y-4">
                  <InfoRow label="Memory Issues" value={cognitionAssessment.has_memory_issues} />
                  {cognitionAssessment.memory_issue_type && (
                    <InfoRow label="Memory Type" value={cognitionAssessment.memory_issue_type} />
                  )}
                  <InfoRow label="Forgets Recent Events" value={cognitionAssessment.forgets_recent_events} />
                  <InfoRow label="Forgets Appointments" value={cognitionAssessment.forgets_appointments} />

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Orientation</h4>
                    <div className="space-y-2">
                      <InfoRow label="Person" value={cognitionAssessment.oriented_to_person} />
                      <InfoRow label="Place" value={cognitionAssessment.oriented_to_place} />
                      <InfoRow label="Time" value={cognitionAssessment.oriented_to_time} />
                    </div>
                  </div>

                  <InfoRow label="Decision Making" value={cognitionAssessment.decision_making_capacity} />
                  <InfoRow label="Communication Ability" value={cognitionAssessment.communication_ability} />
                  <InfoRow label="Experiences Confusion" value={cognitionAssessment.experiences_confusion} />

                  {cognitionAssessment.dementia_diagnosis && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Dementia Diagnosis:</strong> {cognitionAssessment.dementia_type || 'Yes'}
                        {cognitionAssessment.cognitive_impairment_level && 
                          ` (${cognitionAssessment.cognitive_impairment_level} impairment)`
                        }
                      </AlertDescription>
                    </Alert>
                  )}

                  {cognitionAssessment.wandering_risk && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Wandering Risk:</strong> Safety precautions recommended
                      </AlertDescription>
                    </Alert>
                  )}

                  {cognitionAssessment.safety_concerns && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Safety Concerns:</strong> {cognitionAssessment.safety_concerns}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No cognitive assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Network Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Network</CardTitle>
              <CardDescription>Caregivers and support services</CardDescription>
            </CardHeader>
            <CardContent>
              {supportNetwork ? (
                <div className="space-y-6">
                  {supportNetwork.has_formal_caregiver && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Formal Caregiver
                      </h4>
                      <InfoRow label="Type" value={supportNetwork.formal_caregiver_type} />
                      <InfoRow label="Frequency" value={supportNetwork.formal_caregiver_frequency} />
                      {supportNetwork.formal_caregiver_details && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {supportNetwork.formal_caregiver_details}
                        </p>
                      )}
                    </div>
                  )}

                  {supportNetwork.has_informal_caregiver && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informal Caregiver
                      </h4>
                      <InfoRow label="Name" value={supportNetwork.informal_caregiver_name} />
                      <InfoRow label="Relationship" value={supportNetwork.informal_caregiver_relationship} />
                      {supportNetwork.informal_caregiver_phone && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <Phone className="h-4 w-4" />
                          <span>{supportNetwork.informal_caregiver_phone}</span>
                        </div>
                      )}
                      <InfoRow label="Availability" value={supportNetwork.informal_caregiver_availability} />
                    </div>
                  )}

                  {supportNetwork.has_emergency_contact && (
                    <div className="border rounded-lg p-4 bg-red-50">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-900">
                        <AlertCircle className="h-4 w-4" />
                        Emergency Contact
                      </h4>
                      <InfoRow label="Name" value={supportNetwork.emergency_contact_name} />
                      <InfoRow label="Relationship" value={supportNetwork.emergency_contact_relationship} />
                      {supportNetwork.emergency_contact_phone && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">{supportNetwork.emergency_contact_phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {supportNetwork.receives_meals_on_wheels && (
                        <Badge variant="secondary">Meals on Wheels</Badge>
                      )}
                      {supportNetwork.receives_transportation_services && (
                        <Badge variant="secondary">Transportation Services</Badge>
                      )}
                      {supportNetwork.receives_other_services && (
                        <Badge variant="secondary">Other Services</Badge>
                      )}
                    </div>
                    {supportNetwork.other_services_details && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {supportNetwork.other_services_details}
                      </p>
                    )}
                  </div>

                  {supportNetwork.caregiver_burden_concerns && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Caregiver Burden Concerns:</strong> {supportNetwork.caregiver_burden_details}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No support network data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function InfoRow({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: any; 
  highlight?: boolean;
}) {
  if (value === null || value === undefined) return null;

  const displayValue = typeof value === 'boolean' 
    ? value ? 'Yes' : 'No'
    : String(value);

  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'bg-yellow-50 px-2 rounded' : ''}`}>
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm text-muted-foreground">{displayValue}</span>
    </div>
  );
}

function ADLSection({ 
  title, 
  independent, 
  level, 
  notes,
  extra 
}: { 
  title: string; 
  independent?: boolean | null; 
  level?: string | null; 
  notes?: string | null;
  extra?: string;
}) {
  return (
    <div className="border-b pb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        {independent !== null && independent !== undefined && (
          <Badge variant={independent ? 'default' : 'secondary'}>
            {independent ? 'Independent' : 'Needs Assistance'}
          </Badge>
        )}
      </div>
      {level && <p className="text-sm text-muted-foreground">Level: {level}</p>}
      {extra && <p className="text-sm text-muted-foreground italic">{extra}</p>}
      {notes && <p className="text-sm mt-2">{notes}</p>}
    </div>
  );
}

function IADLSection({ 
  title, 
  independent, 
  level, 
  notes 
}: { 
  title: string; 
  independent?: boolean | null; 
  level?: string | null; 
  notes?: string | null;
}) {
  return <ADLSection title={title} independent={independent} level={level} notes={notes} />;
}

