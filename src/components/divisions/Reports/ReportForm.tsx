'use client';

import { useState } from 'react';
import { Save, X, FileText } from 'lucide-react';
import type { ReportTypeDefinition } from './reportConfig';
import UserMultiSelect from './UserMultiSelect';

interface ReportFormProps {
  reportType: ReportTypeDefinition;
  divisionId: string;
  authorId: string;
  onSubmit: (data: {
    report_type: string;
    participants: string[];
    form_data: Record<string, any>;
  }) => Promise<boolean>;
  onCancel: () => void;
  // Edit mode
  initialData?: Record<string, any>;
  initialParticipants?: string[];
}

export default function ReportForm({
  reportType,
  divisionId,
  authorId,
  onSubmit,
  onCancel,
  initialData,
  initialParticipants,
}: ReportFormProps) {
  // Common fields
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState(initialData?.location || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [participants, setParticipants] = useState<string[]>(initialParticipants || []);

  // Dynamic fields
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    reportType.fields.forEach((f) => {
      initial[f.id] = initialData?.[f.id] || '';
    });
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);

  const updateField = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!date || !time) {
      alert('Data i godzina są wymagane.');
      return;
    }
    if (!location.trim()) {
      alert('Lokalizacja jest wymagana.');
      return;
    }

    for (const field of reportType.fields) {
      if (field.required && !fieldValues[field.id]?.trim()) {
        alert(`Pole "${field.label}" jest wymagane.`);
        return;
      }
    }

    setSubmitting(true);

    const form_data: Record<string, any> = {
      date,
      time,
      location: location.trim(),
      description: description.trim(),
      ...Object.fromEntries(
        Object.entries(fieldValues).map(([k, v]) => [k, v.trim()])
      ),
    };

    const success = await onSubmit({
      report_type: reportType.id,
      participants,
      form_data,
    });

    setSubmitting(false);

    if (success) {
      alert('Raport złożony pomyślnie.');
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--mdt-input-bg)',
    color: 'var(--mdt-content-text)',
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Header */}
      <div className="px-3 py-1 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <FileText className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          {reportType.icon} {reportType.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Common fields: date, time, location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
              Data zdarzenia *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="panel-inset w-full px-2 py-1 font-mono text-xs"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
              Godzina *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="panel-inset w-full px-2 py-1 font-mono text-xs"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
              Lokalizacja *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Miejsce zdarzenia"
              className="panel-inset w-full px-2 py-1 font-mono text-xs"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Dynamic fields from reportConfig */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportType.fields.map((field) => (
            <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
                {field.label} {field.required ? '*' : ''}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={fieldValues[field.id] || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="panel-inset w-full px-2 py-1 font-mono text-xs"
                  style={inputStyle}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  value={fieldValues[field.id] || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="panel-inset w-full px-2 py-1 font-mono text-xs resize-y"
                  style={inputStyle}
                />
              )}

              {field.type === 'select' && field.options && (
                <select
                  value={fieldValues[field.id] || ''}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="panel-inset w-full px-2 py-1 font-mono text-xs"
                  style={inputStyle}
                >
                  <option value="">— Wybierz —</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Description (common) */}
        <div>
          <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
            Opis sytuacji
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Szczegółowy opis zdarzenia..."
            rows={4}
            className="panel-inset w-full px-2 py-1 font-mono text-xs resize-y"
            style={inputStyle}
          />
        </div>

        {/* Participants */}
        <UserMultiSelect
          selectedIds={participants}
          onChange={setParticipants}
          excludeId={authorId}
        />

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-win95 flex items-center gap-1 text-xs py-1 px-3"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Save className="w-3 h-3" />
            {submitting ? 'Zapisywanie...' : initialData ? 'Zaktualizuj raport' : 'Złóż raport'}
          </button>
          <button onClick={onCancel} className="btn-win95 flex items-center gap-1 text-xs py-1 px-3">
            <X className="w-3 h-3" />
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
