import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/financeStore';
import type { SemesterInfo } from '../../types';

export function ProgramStep() {
  const { profile, setProfile } = useFinanceStore();

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
      { name: 'Fall 2024', startMonth: 0, endMonth: 3, tuitionAmount: 8000, isCoop: false },
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
                  {semesters.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveSemester(index)}
                      className="ml-auto"
                    >
                      Remove
                    </Button>
                  )}
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
