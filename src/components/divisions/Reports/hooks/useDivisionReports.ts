'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getDivisionReports, createDivisionReport, updateDivisionReport, deleteDivisionReport } from '@/src/lib/db/reports';
import { getReportConfig } from '../reportConfig';

interface Report {
  id: string;
  division: string;
  report_type: string;
  author_id: string;
  participants: string[];
  form_data: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username: string;
    mta_nick: string | null;
    avatar_url: string | null;
    badge: string | null;
  };
}

interface UseDivisionReportsReturn {
  reports: Report[];
  loading: boolean;
  filterType: string;
  setFilterType: (type: string) => void;
  // Create
  handleCreateReport: (data: {
    report_type: string;
    participants: string[];
    form_data: Record<string, any>;
  }) => Promise<boolean>;
  // Update
  handleUpdateReport: (reportId: string, data: {
    participants?: string[];
    form_data?: Record<string, any>;
  }) => Promise<boolean>;
  // Delete
  handleDeleteReport: (reportId: string) => Promise<boolean>;
  // Reload
  reloadReports: () => Promise<void>;
}

export function useDivisionReports(divisionId: string, userId: string | undefined): UseDivisionReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const submittingRef = useRef(false);

  const config = getReportConfig(divisionId);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { reportType?: string; status?: string } = {};
      if (filterType) filters.reportType = filterType;
      const { data } = await getDivisionReports(divisionId, filters);
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [divisionId, filterType]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleCreateReport = async (data: {
    report_type: string;
    participants: string[];
    form_data: Record<string, any>;
  }): Promise<boolean> => {
    if (submittingRef.current || !userId) return false;
    submittingRef.current = true;

    try {
      const { error } = await createDivisionReport({
        division: divisionId,
        report_type: data.report_type,
        author_id: userId,
        participants: data.participants,
        form_data: data.form_data,
      });

      if (error) throw error;
      await loadReports();
      return true;
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Błąd podczas tworzenia raportu.');
      return false;
    } finally {
      submittingRef.current = false;
    }
  };

  const handleUpdateReport = async (reportId: string, data: {
    participants?: string[];
    form_data?: Record<string, any>;
  }): Promise<boolean> => {
    if (submittingRef.current) return false;
    submittingRef.current = true;

    try {
      const { error } = await updateDivisionReport(reportId, data);
      if (error) throw error;
      await loadReports();
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Błąd podczas aktualizacji raportu.');
      return false;
    } finally {
      submittingRef.current = false;
    }
  };

  const handleDeleteReport = async (reportId: string): Promise<boolean> => {
    if (!confirm('Czy na pewno chcesz usunąć ten raport?')) return false;

    try {
      const { error } = await deleteDivisionReport(reportId);
      if (error) throw error;
      await loadReports();
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Błąd podczas usuwania raportu.');
      return false;
    }
  };

  return {
    reports,
    loading,
    filterType,
    setFilterType,
    handleCreateReport,
    handleUpdateReport,
    handleDeleteReport,
    reloadReports: loadReports,
  };
}
