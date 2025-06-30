import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, FileText, Image as ImageIcon, Upload, Calendar, Eye, Download, Trash2, Search, Sparkles, ShieldQuestion, HelpCircle, Wind, Sun, Bug, AlertTriangle, Bone, Activity, Home, ClipboardList, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createWorker } from 'tesseract.js';
import pdfToText from 'react-pdftotext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface MedicalRecord {
  id: string;
  pet_id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string;
  files: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

interface Log {
  id: string;
  pet_id: string;
  user_id: string;
  title: string;
  log_text: string;
  created_at: string;
}

const LucideIcons = { Sparkles, ShieldQuestion, HelpCircle, Wind, Sun, Bug, AlertTriangle, Bone, Activity, Home, ShieldCheck: ShieldQuestion, ShieldAlert: ShieldQuestion, ShieldX: ShieldQuestion };

const MedicalRecordsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activePet, reminders } = usePet();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [recordTitle, setRecordTitle] = useState('');
  const [tempFileData, setTempFileData] = useState<{ data: string, file: File } | null>(null);

  const [logs, setLogs] = useState<Log[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logTitle, setLogTitle] = useState('');
  const [logText, setLogText] = useState('');

  const [report, setReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [activeView, setActiveView] = useState('report');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 640);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  const sidebarItems = [
    { view: 'report', Icon: Sparkles, title: 'AI Health Report', description: "Real-time health summary", color: '#8B5CF6' },
    { view: 'upload', Icon: BookOpen, title: 'Manage Records', description: "Upload & view documents", color: '#10B981' },
    { view: 'log', Icon: ClipboardList, title: 'Log a Note', description: "Jot down observations", color: '#3B82F6' },
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location", error);
        setReportError("Could not get location. Please allow location access for environmental analysis.");
      }
    );
  }, []);

  const handleGenerateReport = async () => {
    if (!activePet) {
      setReportError('An active pet is required to generate a report.');
      return;
    }
    setIsGeneratingReport(true);
    setReportError(null);
    setReport(null);

    try {
      // Fetch all reminders for the pet
      const { data: allReminders, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .eq('pet_id', activePet.id);
      if (remindersError) {
        console.error('Reminders fetch error:', remindersError);
        setReportError('Failed to fetch reminders.');
        setIsGeneratingReport(false);
        return;
      }
      console.log('All reminders:', allReminders);

      // Fetch all medical records for the pet
      const { data: allRecords, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', activePet.id);
      if (recordsError) {
        console.error('Records fetch error:', recordsError);
        setReportError('Failed to fetch medical records.');
        setIsGeneratingReport(false);
        return;
      }
      console.log('All records:', allRecords);

      // Fetch all logs for the pet
      const { data: allLogs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('pet_id', activePet.id);
      if (logsError) {
        console.error('Logs fetch error:', logsError);
        setReportError('Failed to fetch logs.');
        setIsGeneratingReport(false);
        return;
      }
      console.log('All logs:', allLogs);

      // Fetch the latest pet profile from DB
      const { data: petProfile, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', activePet.id)
        .single();
      if (petError) {
        console.error('Pet profile fetch error:', petError);
        setReportError('Failed to fetch pet profile.');
        setIsGeneratingReport(false);
        return;
      }
      console.log('Pet profile:', petProfile);

      // POST all data to backend to generate PDF
      const response = await fetch('http://localhost:3000/api/generate-health-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet: petProfile || {},
          records: allRecords || [],
          reminders: allReminders || [],
          logs: allLogs || [],
        }),
      });

      if (!response.ok) {
        let errMsg = 'Failed to generate report';
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {}
        setReportError(errMsg);
        setIsGeneratingReport(false);
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${petProfile.name || 'pet'}-medical-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setReport({ success: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setReportError(err.message || 'An unexpected error occurred.');
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setReportError((err as any).message || 'An unexpected error occurred.');
      } else {
        setReportError('An unexpected error occurred.');
      }
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  const getStatusColor = (level: string) => {
    switch(level?.toLowerCase()) {
        case 'good': return '#10B981';
        case 'fair': return '#F59E0B';
        case 'caution': return '#F97316';
        case 'poor': return '#EF4444';
        case 'urgent': return '#DC2626';
        default: return '#6B7280';
    }
  }

  const renderReportSection = (title: string, items: any[], color: string) => (
    <div className="mb-4">
        <h3 className={`text-lg font-bold mb-2`} style={{color: color}}>{title}</h3>
        {items.map((item, index) => {
            const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] || HelpCircle;
            return (
                <div key={index} className="flex items-start p-3 border-b border-gray-200">
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: `${color}20`}}>
                        <Icon size={20} color={color} />
                      </div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                </div>
            );
        })}
    </div>
  );

  const uploadOptions = [
    {
      id: '1',
      title: 'Upload Document',
      description: 'PDF files',
      icon: FileText,
      color: '#8B5CF6',
      accept: 'application/pdf',
    },
    {
      id: '2',
      title: 'Upload Image',
      description: 'Photos of medical records',
      icon: ImageIcon,
      color: '#10B981',
      accept: 'image/*',
    },
    {
      id: '3',
      title: 'Log a Note',
      description: 'Record observations or notes',
      icon: ClipboardList,
      color: '#3B82F6',
      accept: null,
    },
  ];

  const handleUploadClick = (accept: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        const file = target.files[0];
        // Store the file temporarily
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setTempFileData({
            data: reader.result as string,
            file: file
          });
          setRecordTitle(file.name); // Set default title as file name
          setShowTitleInput(true);
        };
      }
    };
    input.click();
  };

  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchMedicalRecords = async () => {
    if (!activePet?.id) {
      console.log('No active pet found');
      return;
    }
    
    try {
      console.log('Fetching records for pet:', activePet.id);
      
      const { data, error } = await retryOperation(async () => 
        await supabase
          .from('medical_records')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('date', { ascending: false })
      );

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Fetched records:', data);
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      alert('Failed to fetch medical records. Please check your internet connection and try again.');
    }
  };

  const fetchLogs = async () => {
    if (!activePet?.id) {
      return;
    }
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('pet_id', activePet.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const generatePdf = (logsToExport: Log[]) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`Log History for ${activePet?.name || 'Your Pet'}`, 14, 22);

    const tableColumn = ["Date", "Title", "Note"];
    const tableRows: (string | null)[][] = [];

    logsToExport.forEach(log => {
      const logData = [
        new Date(log.created_at).toLocaleString(),
        log.title,
        log.log_text,
      ];
      tableRows.push(logData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.output('dataurlnewwindow');
  };

  const handleSaveLog = async () => {
    if (!logTitle || !logText) {
      alert('Please provide a title and a note.');
      return;
    }
    if (!activePet?.id || !user?.id) return;

    try {
      const { data, error } = await retryOperation(async () =>
        supabase
          .from('logs')
          .insert({
            pet_id: activePet.id,
            user_id: user.id,
            title: logTitle,
            log_text: logText,
          })
          .select()
          .single()
      );

      if (error) throw error;
      
      setShowLogForm(false);
      setLogTitle('');
      setLogText('');
      await fetchLogs();
      alert('Log saved successfully!');
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Failed to save log. Please try again.');
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete log. Please try again.');
        return;
      }
      await fetchLogs();
      alert('Log has been deleted.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete log. Please try again.');
    }
  };

  const handleDownloadAllAsZip = async () => {
    if (records.length === 0) {
      alert('No records to download.');
      return;
    }

    const zip = new JSZip();
    records.forEach(record => {
      if (record.files) {
        Object.entries(record.files).forEach(([fileName, fileData]) => {
          const base64Data = fileData.split(',')[1];
          if(base64Data) {
            zip.file(fileName, base64Data, { base64: true });
          }
        });
      }
    });

    zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, `${activePet?.name || 'pet'}-medical-records.zip`);
    });
  };

  const handleUpload = async () => {
    if (!tempFileData || !activePet?.id) return;

    try {
      setIsUploading(true);
      
      // Extract text from the stored file
      let extractedText = '';
      try {
        if (tempFileData.file.type === 'application/pdf') {
          // Handle PDF text extraction
          const response = await fetch(tempFileData.data);
          const blob = await response.blob();
          extractedText = await pdfToText(blob);
        } else if (tempFileData.file.type.startsWith('image/')) {
          // Handle image OCR
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(tempFileData.data);
          await worker.terminate();
          extractedText = text;
        }
      } catch (error) {
        console.error('Text extraction error:', error);
        extractedText = 'Text extraction failed';
      }

      const record = {
        pet_id: activePet.id,
        user_id: user?.id,
        title: recordTitle,
        description: extractedText,
        date: new Date().toISOString(),
        files: { [tempFileData.file.name]: tempFileData.data }
      };

      const { data, error } = await retryOperation(async () => 
        await supabase
          .from('medical_records')
          .insert(record)
          .select()
          .single()
      );

      if (error) {
        console.error('Database error details:', error);
        throw new Error('Failed to upload record');
      }

      console.log('Record inserted successfully:', data);
      await fetchMedicalRecords();
      setIsUploading(false);
      setShowTitleInput(false);
      setTempFileData(null);
      setRecordTitle('');
      alert('Medical record uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      setIsUploading(false);
      setShowTitleInput(false);
      if (error instanceof Error) {
        alert(`Failed to upload document. Please check your internet connection and try again. Error: ${error.message}`);
      } else {
        alert('Failed to upload document. Please check your internet connection and try again.');
      }
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this medical record?')) return;

    try {
      const { error } = await supabase
          .from('medical_records')
          .delete()
        .eq('id', recordId);

      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete record. Please try again.');
        return;
      }
      await fetchMedicalRecords();
      alert('Medical record has been deleted.');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleDownload = (record: MedicalRecord) => {
    try {
      if (!record.files) {
        alert('No file available for download');
        return;
      }

      const fileName = Object.keys(record.files)[0];
      const fileData = record.files[fileName];
      
      if (!fileData) {
        alert('File data is missing');
        return;
      }

      // Create a link element
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    return records.filter(record =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    return logs.filter(log =>
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.log_text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logs, searchQuery]);

  const renderContent = () => {
    switch (activeView) {
      case 'report':
  return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Health Report</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-hover"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                cursor: (isGeneratingReport || !location) ? 'not-allowed' : 'pointer',
                opacity: (isGeneratingReport || !location) ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => !(isGeneratingReport || !location) && handleGenerateReport()}
            >
    <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
              {isGeneratingReport ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              ) : (
                  <Sparkles size={24} color="#8B5CF6" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  margin: 0
                }}>
                  Generate Health Report
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontFamily: 'Nunito',
                  marginTop: '2px',
                  margin: 0
                }}>
                  Real-time summary using pet records & local factors.
                </p>
              </div>
            </motion.div>
            {reportError && <p className="text-red-500 text-sm mt-4 text-center">{reportError}</p>}
            {report && (
              <div className="mt-6">
                {report.overallStatus && (() => {
                    const Icon = LucideIcons[report.overallStatus.icon as keyof typeof LucideIcons] || ShieldQuestion;
                    const color = getStatusColor(report.overallStatus.level);
                    return (
                        <div className="p-4 rounded-lg mb-4 flex items-center gap-4" style={{ backgroundColor: `${color}20` }}>
                            <Icon size={32} color={color}/>
                            <div>
                                <h3 className="font-bold text-lg" style={{ color }}>{report.overallStatus.level} Health</h3>
                                <p className="text-sm" style={{ color }}>{report.overallStatus.summary}</p>
                            </div>
                        </div>
                    );
                })()}
                {report.potentialRisks && renderReportSection("Potential Risks", report.potentialRisks, '#EF4444')}
                {report.recommendations && renderReportSection("Recommendations", report.recommendations, '#10B981')}
              </div>
            )}
            {report && report.success && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-semibold">Medical report generated and downloaded!</p>
              </div>
            )}
        </div>
        );
      case 'upload':
        return (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Add New Record</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {uploadOptions.slice(0, 2).map((option, index) => {
              const IconComponent = option.icon;
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.6 : 1,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                    onClick={() => !isUploading && option.accept && handleUploadClick(option.accept)}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '24px',
                    backgroundColor: `${option.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <IconComponent size={24} color={option.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#374151',
                      fontFamily: 'Nunito',
                      margin: 0
                    }}>
                      {option.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      fontFamily: 'Nunito',
                      marginTop: '2px',
                      margin: 0
                    }}>
                      {option.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
        </div>

            <AnimatePresence>
        {showTitleInput && (
            <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="p-4 bg-white rounded-lg"
            >
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px', fontFamily: 'Nunito' }}>
                Name Your Record
              </h3>
              <input
                type="text"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '15px',
                  marginBottom: '20px',
                  fontFamily: 'Nunito',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="Enter record title"
              />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                     <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowTitleInput(false);
                          setTempFileData(null);
                          setRecordTitle('');
                        }}
                        style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '15px', fontWeight: '600', cursor: 'pointer', padding: '12px 24px', fontFamily: 'Nunito' }}
                      >
                        Cancel
                      </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  style={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Nunito',
                    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Upload
                </motion.button>
              </div>
            </motion.div>
        )}
            </AnimatePresence>

        {/* Records List */}
        <div style={{ 
          marginTop: '32px',
          background: '#F9FAFB',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px',
            fontFamily: 'Nunito'
          }}>
                Recent Medical Records
          </h3>
              {filteredRecords.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 0',
              color: '#6B7280',
              fontSize: '15px',
              fontFamily: 'Nunito'
            }}>
              No medical records found. Upload one to get started.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              padding: '4px'
            }}>
                  {filteredRecords.slice(0, 6).map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:-translate-y-[1px] hover:shadow-sm"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '200px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '8px',
                    height: '100px',
                    marginBottom: '12px'
                  }}>
                    {record.files && Object.keys(record.files)[0].toLowerCase().endsWith('.pdf') ? (
                      <FileText size={32} color="#6B7280" />
                    ) : (
                      <ImageIcon size={32} color="#6B7280" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#111827',
                      margin: 0,
                      marginBottom: '4px',
                      fontFamily: 'Nunito',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {record.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '8px'
                    }}>
                      <Calendar size={12} color="#9CA3AF" />
                      <span style={{
                        fontSize: '13px',
                        color: '#9CA3AF',
                        fontFamily: 'Nunito'
                      }}>
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid #E5E7EB'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(record)}
                      style={{
                        background: '#F3F4F6',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Download size={16} color="#4B5563" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteRecord(record.id)}
                      style={{
                        background: '#FEE2E2',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
               {filteredRecords.length > 0 && (
                <div className="mt-8 text-center">
                  <motion.button
                    onClick={handleDownloadAllAsZip}
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Nunito',
                      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Download All Records (ZIP)
                  </motion.button>
        </div>
              )}
      </div>
          </div>
        );
      case 'log':
        return (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Log a Note</h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card-hover"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.05)',
                  cursor: 'pointer'
                }}
                onClick={() => setShowLogForm(!showLogForm)}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '24px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <ClipboardList size={24} color="#3B82F6" />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', fontFamily: 'Nunito', margin: 0 }}>
                    Add a New Log
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Nunito', marginTop: '2px', margin: 0 }}>
                    Record observations and notes about your pet.
                  </p>
                </div>
              </motion.div>
            
              <AnimatePresence>
                {showLogForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="p-4 bg-white rounded-lg"
                  >
                     <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px', fontFamily: 'Nunito' }}>
                      New Log Entry
                    </h3>
                    <input
                      type="text"
                      value={logTitle}
                      onChange={(e) => setLogTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        fontSize: '15px',
                        marginBottom: '12px',
                        fontFamily: 'Nunito',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="Enter note title"
                    />
                    <textarea
                      value={logText}
                      onChange={(e) => setLogText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #E5E7EB',
                        fontSize: '15px',
                        marginBottom: '20px',
                        fontFamily: 'Nunito',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                      placeholder="Write your note here..."
                    />
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLogForm(false)} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '15px', fontWeight: '600', cursor: 'pointer', padding: '12px 24px', fontFamily: 'Nunito' }}>
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveLog} style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Nunito', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)', transition: 'all 0.2s ease' }}>
                        Save Note
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-32 text-center">
            <br />
            <br />
            <br />
              <motion.button
                onClick={() => generatePdf(filteredLogs)}
                disabled={filteredLogs.length === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'Nunito',
                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
                  transition: 'all 0.2s ease',
                  opacity: filteredLogs.length === 0 ? 0.6 : 1,
                }}
              >
                View All Logs
              </motion.button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
    if (activePet?.id) {
        fetchLogs();
    }
  }, [activePet?.id]);

  useEffect(() => {
    if (activeView === 'log' || activeView === 'upload') {
      fetchLogs();
      fetchMedicalRecords();
    }
  }, [activeView]);

  return (
    <div className="flex flex-col" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 50%, #FFE5B4 100%)',
      position: 'relative',
    }}>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px 0 20px'
        }}>
          <motion.button
  onClick={() => navigate(-1)}
  className="p-3 rounded-full bg-gradient-to-br from-purple-200 via-white to-purple-100 shadow-lg border-2 border-purple-300 hover:border-purple-500 transition"
  whileHover={{ scale: 1.08, boxShadow: "0px 8px 24px rgba(139,92,246,0.15)" }}
  whileTap={{ scale: 0.95 }}
  style={{
    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.10)',
    transition: 'all 0.2s'
  }}
>
  <ArrowLeft className="w-6 h-6 text-purple-600" />
</motion.button>

          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 mx-4"
              >
               <input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search records and logs..."
  className="w-full px-5 py-3 text-md bg-white rounded-xl border-2 border-purple-200 focus:border-purple-500 shadow-md focus:outline-none transition"
  style={{
    fontFamily: 'Nunito',
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)'
  }}
/>
              </motion.div>
            ) : (
              <motion.h1 
                key="title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-2xl font-bold text-gray-800"
              >
                Medical Records
              </motion.h1>
            )}
          </AnimatePresence>
          <motion.button 
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }} 
            className="p-3 rounded-full bg-white/70 backdrop-blur-sm shadow-md"
            whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"}}
            whileTap={{ scale: 0.95 }}
          >
            {showSearch ? <X className="w-5 h-5 text-purple-600" /> : <Search className="w-5 h-5 text-purple-600" />}
          </motion.button>
        </div>
      </div>

      {/* Horizontal Navigation & Main Content */}
      <div className="flex-grow overflow-y-auto" style={{ padding: '0 20px' }}>
        {/* Horizontal Navigation */}
        <div className="mb-8 mt-4">
  {isMobile ? (
    <div className="mb-4">
      <select
        value={activeView}
        onChange={e => setActiveView(e.target.value)}
        className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold shadow-sm focus:border-purple-400 focus:outline-none"
        style={{ fontFamily: 'Nunito', fontSize: '16px' }}
      >
        {sidebarItems.map(item => (
          <option key={item.view} value={item.view}>{item.title}</option>
        ))}
      </select>
    </div>
  ) : (
    <nav className="flex items-stretch justify-center max-w-3xl mx-auto">
      {sidebarItems.map((item, index) => {
        const { view, Icon, title, description, color } = item;
        const isActive = activeView === view;
        const borderRadius =
          index === 0 ? '16px 0 0 16px' :
          index === sidebarItems.length - 1 ? '0 16px 16px 0' :
          '0';
        return (
          <motion.div
            key={view}
            onClick={() => setActiveView(view)}
            className="flex-1 card-hover"
            animate={{
              backgroundColor: isActive ? `${color}20` : 'rgba(255, 255, 255, 0.7)',
              borderColor: isActive ? color : 'rgba(229, 231, 235, 0.7)',
              zIndex: isActive ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -3, scale: 1.01, zIndex: 2 }}
            whileTap={{ scale: 0.99 }}
            style={{
              position: 'relative',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              border: '2px solid rgba(229, 231, 235, 0.7)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: borderRadius,
              marginLeft: index === 0 ? '0' : '-2px',
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              flexShrink: 0,
              background: `${color}20`,
            }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: isActive ? color : '#374151',
                fontFamily: 'Nunito',
                margin: '0 0 2px 0',
                transition: 'color 0.3s'
              }}>
                {title}
              </h4>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                fontFamily: 'Nunito',
                margin: 0,
              }}>
                {description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </nav>
  )}
</div>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto pb-12">
          {renderContent()}
        </main>
      </div>
        
      {/* Modals */}
    </div>
  );
};

export default MedicalRecordsScreen;