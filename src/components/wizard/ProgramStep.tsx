import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useFinanceStore } from '../../store/financeStore';
import type { SemesterInfo } from '../../types';

export function ProgramStep() {
  const {
    profile,
    setProfile,
    universityProfiles,
    saveUniversityProfile,
    loadUniversityProfile,
    deleteUniversityProfile
  } = useFinanceStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [profileName, setProfileName] = useState('');

  const [programLengthYears, setProgramLengthYears] = useState(
    profile?.programLength ? Math.floor(profile.programLength / 12) : 4
  );
  const [graduationDate, setGraduationDate] = useState(
    profile?.expectedGraduationDate
      ? profile.expectedGraduationDate.toISOString().split('T')[0]
      : ''
  );
  const [semesters, setSemesters] = useState<Partial<SemesterInfo>[]>(
    profile?.semesterStructure || [
      {
        name: 'Fall 2024',
        startMonth: 0,
        endMonth: 3,
        tuitionAmount: 8000,
        isCoop: false
      },
    ]
  );

  const handleAddSemester = () => {
    setSemesters([
      ...semesters,
      {
        name: '',
        startMonth: 0,
        endMonth: 3,
        tuitionAmount: 8000,
        isCoop: false,
      },
    ]);
  };

  const handleRemoveSemester = (index: number) => {
    setSemesters(semesters.filter((_, i) => i !== index));
  };

  const handleDuplicateSemester = (index: number) => {
    const semesterToDuplicate = semesters[index];
    const duplicatedSemester = {
      ...semesterToDuplicate,
      name: `${semesterToDuplicate.name || `Semester ${index + 1}`} (Copy)`,
    };
    setSemesters([...semesters, duplicatedSemester]);
  };

  const handleSave = () => {
    const programLength = programLengthYears * 12;
    const expectedGraduationDate = graduationDate
      ? new Date(graduationDate)
      : new Date();

    setProfile({
      programLength,
      currentMonth: 0,
      expectedGraduationDate,
      semesterStructure: semesters.map((s, i) => ({
        id: `semester-${i}`,
        name: s.name || `Semester ${i + 1}`,
        startMonth: s.startMonth || 0,
        endMonth: s.endMonth || 3,
        tuitionAmount: s.tuitionAmount || 0,
        isCoop: s.isCoop || false,
      })),
    });
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      alert('Please enter a profile name');
      return;
    }
    handleSave(); // Save current data first
    saveUniversityProfile(profileName);
    setProfileName('');
    setShowSaveDialog(false);
  };

  const handleLoadProfile = (profileId: string) => {
    if (!profileId) return;
    loadUniversityProfile(profileId);
    const loaded = universityProfiles.find(p => p.id === profileId);
    if (loaded) {
      setProgramLengthYears(Math.floor(loaded.programLength / 12));
      setSemesters(loaded.semesterStructure);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Program & Timeline
        </h2>
        <p className="text-gray-600">
          Tell us about your academic program and timeline
        </p>
      </div>

      {/* University Profile Management */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-3">🎓 University Profiles</h3>

        {/* Load Profile */}
        {universityProfiles.length > 0 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Load Saved Profile
            </label>
            <div className="flex gap-2">
              <Select
                value=""
                onChange={(e) => handleLoadProfile(e.target.value)}
                options={[
                  { value: '', label: 'Select a university profile...' },
                  ...universityProfiles.map(p => ({
                    value: p.id,
                    label: `${p.name} (${Math.floor(p.programLength / 12)} years, ${p.semesterStructure.length} terms)`
                  }))
                ]}
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* Save Current as Profile */}
        {!showSaveDialog && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            fullWidth
          >
            💾 Save Current Setup as Profile
          </Button>
        )}

        {showSaveDialog && (
          <div className="space-y-2">
            <Input
              label="Profile Name"
              placeholder="e.g., Waterloo Engineering, UofT CS"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} fullWidth>
                Save Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setProfileName('');
                }}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Saved Profiles List */}
        {universityProfiles.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-200">
            <div className="text-xs text-purple-700 font-medium mb-2">Saved Profiles ({universityProfiles.length})</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {universityProfiles.map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1">
                  <span className="text-gray-700">{p.name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}" profile?`)) {
                        deleteUniversityProfile(p.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Program Length (Years)"
          value={programLengthYears}
          onChange={(e) => setProgramLengthYears(Number(e.target.value))}
          min={1}
          max={10}
        />
        <Input
          type="date"
          label="Expected Graduation Date"
          value={graduationDate}
          onChange={(e) => setGraduationDate(e.target.value)}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Semester Structure</h3>
          <Button size="sm" onClick={handleAddSemester}>
            Add Semester
          </Button>
        </div>

        <div className="space-y-4">
          {semesters.map((semester, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Semester Name"
                  value={semester.name}
                  onChange={(e) => {
                    const updated = [...semesters];
                    updated[index].name = e.target.value;
                    setSemesters(updated);
                  }}
                  placeholder="e.g., Fall 2024"
                />
                <Input
                  type="number"
                  label="Tuition Amount"
                  value={semester.tuitionAmount}
                  onChange={(e) => {
                    const updated = [...semesters];
                    updated[index].tuitionAmount = Number(e.target.value);
                    setSemesters(updated);
                  }}
                  placeholder="8000"
                />
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={semester.isCoop}
                      onChange={(e) => {
                        const updated = [...semesters];
                        updated[index].isCoop = e.target.checked;
                        setSemesters(updated);
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">Co-op Term</span>
                  </label>
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateSemester(index)}
                    >
                      Duplicate
                    </Button>
                    {semesters.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveSemester(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} fullWidth>
        Save & Continue
      </Button>
    </div>
  );
}
