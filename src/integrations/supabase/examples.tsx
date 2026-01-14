/**
 * Supabase Integration Examples
 *
 * This file demonstrates how to use Supabase hooks in your components.
 * DO NOT import this file directly - it's just for reference.
 */

import { usePatients, usePatient, useCreatePatient, useUpdatePatient, useDeletePatient, useSearchPatients } from '@/integrations/supabase/hooks/use-patients';

/**
 * Example 1: Fetch and display all patients
 */
export function ExamplePatientsList() {
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) return <div>Loading patients...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>All Patients</h2>
      {patients?.map((patient) => (
        <div key={patient.id}>
          <h3>{patient.name}</h3>
          <p>Age: {patient.age}</p>
          <p>Status: {patient.status}</p>
          <p>Insurance: {patient.insurance}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Fetch a single patient
 */
export function ExamplePatientDetail({ patientId }: { patientId: string }) {
  const { data: patient, isLoading, error } = usePatient(patientId);

  if (isLoading) return <div>Loading patient...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <h2>{patient.name}</h2>
      <p><strong>Case ID:</strong> {patient.case_id}</p>
      <p><strong>Age:</strong> {patient.age}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>
      <p><strong>Status:</strong> {patient.status}</p>
      <p><strong>Insurance:</strong> {patient.insurance}</p>
      <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
      <p><strong>Facility Type:</strong> {patient.facility_type}</p>
      <p><strong>Language:</strong> {patient.preferred_language}</p>
      <p><strong>Referral Date:</strong> {patient.referral_date}</p>
    </div>
  );
}

/**
 * Example 3: Create a new patient
 */
export function ExampleCreatePatient() {
  const createPatient = useCreatePatient();

  const handleCreatePatient = async () => {
    try {
      const newPatient = await createPatient.mutateAsync({
        name: 'John Doe',
        age: 65,
        case_id: 'CASE-' + Date.now(),
        status: 'Intake',
        insurance: 'Medicaid',
        diagnosis: 'Requires long-term care',
        facility_type: 'Nursing Home',
        preferred_language: 'English',
        phone: '+15551234567',
        referral_date: new Date().toISOString(),
      });

      console.log('Patient created:', newPatient);
      alert('Patient created successfully!');
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient');
    }
  };

  return (
    <div>
      <button onClick={handleCreatePatient} disabled={createPatient.isPending}>
        {createPatient.isPending ? 'Creating...' : 'Create Patient'}
      </button>
      {createPatient.isError && (
        <p style={{ color: 'red' }}>Error: {createPatient.error.message}</p>
      )}
    </div>
  );
}

/**
 * Example 4: Update a patient
 */
export function ExampleUpdatePatient({ patientId }: { patientId: string }) {
  const updatePatient = useUpdatePatient();

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updatePatient.mutateAsync({
        id: patientId,
        updates: {
          status: newStatus,
        },
      });

      alert('Patient status updated!');
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update patient');
    }
  };

  return (
    <div>
      <h3>Update Patient Status</h3>
      <button onClick={() => handleUpdateStatus('Assessment')} disabled={updatePatient.isPending}>
        Set to Assessment
      </button>
      <button onClick={() => handleUpdateStatus('Approved')} disabled={updatePatient.isPending}>
        Set to Approved
      </button>
      <button onClick={() => handleUpdateStatus('Placed')} disabled={updatePatient.isPending}>
        Set to Placed
      </button>
    </div>
  );
}

/**
 * Example 5: Delete a patient
 */
export function ExampleDeletePatient({ patientId }: { patientId: string }) {
  const deletePatient = useDeletePatient();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await deletePatient.mutateAsync(patientId);
      alert('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deletePatient.isPending}
      style={{ color: 'red' }}
    >
      {deletePatient.isPending ? 'Deleting...' : 'Delete Patient'}
    </button>
  );
}

/**
 * Example 6: Search patients
 */
export function ExampleSearchPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: patients, isLoading } = useSearchPatients(searchTerm);

  return (
    <div>
      <input
        type="text"
        placeholder="Search patients by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && <p>Searching...</p>}

      {patients && (
        <div>
          <p>Found {patients.length} patients</p>
          {patients.map((patient) => (
            <div key={patient.id}>
              <h4>{patient.name}</h4>
              <p>{patient.case_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Complete CRUD component
 */
export function ExamplePatientManagement() {
  const { data: patients, isLoading } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    phone: '',
    insurance: 'Medicaid',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPatient.mutateAsync({
        name: formData.name,
        age: formData.age,
        phone: formData.phone,
        insurance: formData.insurance,
        case_id: 'CASE-' + Date.now(),
        status: 'New',
      });

      // Reset form
      setFormData({ name: '', age: 0, phone: '', insurance: 'Medicaid' });
      alert('Patient created successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Patient Management</h2>

      {/* Create Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <select
          value={formData.insurance}
          onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
        >
          <option value="Medicaid">Medicaid</option>
          <option value="Medicare">Medicare</option>
          <option value="Private">Private</option>
        </select>
        <button type="submit" disabled={createPatient.isPending}>
          {createPatient.isPending ? 'Creating...' : 'Create Patient'}
        </button>
      </form>

      {/* Patients List */}
      {isLoading && <p>Loading patients...</p>}

      {patients && (
        <div>
          <h3>Patients ({patients.length})</h3>
          {patients.map((patient) => (
            <div key={patient.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
              <h4>{patient.name}</h4>
              <p>Age: {patient.age} | Status: {patient.status}</p>
              <button
                onClick={() => updatePatient.mutate({
                  id: patient.id,
                  updates: { status: 'Approved' },
                })}
              >
                Approve
              </button>
              <button
                onClick={() => deletePatient.mutate(patient.id)}
                style={{ marginLeft: '10px', color: 'red' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Required import for useState
import { useState } from 'react';
