import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  Plus,
  FileText,
  Image as ImageIcon,
  Camera,
  Upload,
  Calendar,
  Eye,
  Download,
  Trash2,
  Search,
  Sparkles,
  ShieldQuestion,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { usePet } from '../../../contexts/PetContext';
import * as Location from 'expo-location';
import * as LucideIcons from 'lucide-react-native';

export default function MedicalRecordsScreen() {
  const { activePet, addMedicalRecord, medicalRecords, reminders } = usePet();
  const [isUploading, setIsUploading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setReportError('Permission to access location was denied for environmental analysis.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const handleGenerateReport = async () => {
    if (!activePet) {
      setReportError('An active pet is required to generate a report.');
      return;
    }
    if (!location) {
      setReportError('Could not determine your location. Please ensure location services are enabled.');
      return;
    }

    setIsGeneratingReport(true);
    setReportError(null);
    setReport(null);

    try {
      const response = await fetch('https://backend-2-e4ub.onrender.com/api/generate-health-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet: activePet,
          records: medicalRecords[activePet.id] || [],
          reminders: reminders[activePet.id] || [],
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setReportError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const renderReportSection = (title: string, items: any[], color: string) => (
    <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        {items.map((item, index) => {
            const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
            return (
                <View key={index} style={styles.reportItem}>
                    <View style={[styles.reportItemIcon, { backgroundColor: `${color}20` }]}>
                        <Icon size={24} color={color} />
                    </View>
                    <View style={styles.itemTextContainer}>
                        <Text style={styles.reportItemTitle}>{item.title}</Text>
                        <Text style={styles.reportItemDescription}>{item.description}</Text>
                    </View>
                </View>
            );
        })}
    </View>
  );
  
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

  const mockRecords = activePet?.medicalRecords || [
    {
      id: '1',
      title: 'Annual Checkup Report',
      date: '2024-01-15',
      type: 'document' as const,
      file: 'checkup_report.pdf',
      extractedText: 'Annual health examination shows good overall health. Weight: 25kg. Vaccinations up to date.',
    },
    {
      id: '2',
      title: 'X-Ray Results',
      date: '2024-01-10',
      type: 'image' as const,
      file: 'https://images.pexels.com/photos/4269362/pexels-photo-4269362.jpeg?auto=compress&cs=tinysrgb&w=300',
      extractedText: 'X-ray examination of chest area. No abnormalities detected.',
    },
    {
      id: '3',
      title: 'Blood Test Results',
      date: '2024-01-05',
      type: 'document' as const,
      file: 'blood_test.pdf',
      extractedText: 'Complete blood count within normal ranges. Liver function normal. Kidney function normal.',
    },
  ];

  const handleDocumentPick = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Simulate OCR processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newRecord = {
          title: asset.name,
          date: new Date().toISOString().split('T')[0],
          type: asset.mimeType?.startsWith('image/') ? 'image' as const : 'document' as const,
          file: asset.uri,
          extractedText: 'OCR processing completed. Document content extracted and stored.',
        };

        if (activePet) {
          addMedicalRecord(activePet.id, newRecord);
        }
        
        Alert.alert('Success', 'Medical record uploaded and processed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Simulate OCR processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newRecord = {
          title: `Medical Image - ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'image' as const,
          file: asset.uri,
          extractedText: 'Image processed with OCR. Text content extracted and stored.',
        };

        if (activePet) {
          addMedicalRecord(activePet.id, newRecord);
        }
        
        Alert.alert('Success', 'Medical image uploaded and processed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Please allow camera access to capture medical records.');
        return;
      }

      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Simulate OCR processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newRecord = {
          title: `Captured Document - ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'image' as const,
          file: asset.uri,
          extractedText: 'Document captured and processed with OCR. Text content extracted.',
        };

        if (activePet) {
          addMedicalRecord(activePet.id, newRecord);
        }
        
        Alert.alert('Success', 'Medical record captured and processed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this medical record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Implementation would remove from context
            Alert.alert('Deleted', 'Medical record has been deleted.');
          }
        },
      ]
    );
  };

  const uploadOptions = [
    {
      id: '1',
      title: 'Upload Document',
      description: 'PDF, Word, or text files',
      icon: FileText,
      color: '#8B5CF6',
      action: handleDocumentPick,
    },
    {
      id: '2',
      title: 'Upload Image',
      description: 'Photos of medical records',
      icon: ImageIcon,
      color: '#10B981',
      action: handleImagePick,
    },
    {
      id: '3',
      title: 'Take Photo',
      description: 'Capture with camera',
      icon: Camera,
      color: '#F59E0B',
      action: handleCameraCapture,
    },
  ];

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Medical Records</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Health Report Section */}
        <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>AI Health Report</Text>
            <Text style={styles.sectionSubtitle}>
                Generate a real-time health summary for {activePet?.name || 'your pet'} using their records and local environmental factors.
            </Text>
            <TouchableOpacity 
                style={[styles.generateButton, (isGeneratingReport || !location) && styles.disabledOption]} 
                onPress={handleGenerateReport}
                disabled={isGeneratingReport || !location}
            >
              {isGeneratingReport ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generate Health Report</Text>
                </>
              )}
            </TouchableOpacity>

            {reportError && <Text style={styles.errorText}>{reportError}</Text>}

            {report && (
              <View style={styles.reportContainer}>
                {report.overallStatus && (() => {
                    const Icon = LucideIcons[report.overallStatus.icon as keyof typeof LucideIcons] || ShieldQuestion;
                    return (
                        <View style={[styles.overallStatus, { backgroundColor: `${getStatusColor(report.overallStatus.level)}20` }]}>
                            <Icon size={32} color={getStatusColor(report.overallStatus.level)}/>
                            <View style={{ flex: 1}}>
                                <Text style={[styles.overallStatusTitle, { color: getStatusColor(report.overallStatus.level) }]}>{report.overallStatus.level} Health</Text>
                                <Text style={styles.overallStatusSummary}>{report.overallStatus.summary}</Text>
                            </View>
                        </View>
                    );
                })()}
                {report.potentialRisks && renderReportSection("Potential Risks", report.potentialRisks, '#EF4444')}
                {report.recommendations && renderReportSection("Recommendations", report.recommendations, '#10B981')}
              </View>
            )}
        </View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Add New Record</Text>
          <Text style={styles.sectionSubtitle}>
            Upload documents or images. OCR will automatically extract text content.
          </Text>
          
          <View style={styles.uploadOptions}>
            {uploadOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.uploadOption, isUploading && styles.disabledOption]}
                onPress={option.action}
                disabled={isUploading}
              >
                <View style={[styles.uploadIcon, { backgroundColor: `${option.color}20` }]}>
                  <option.icon size={24} color={option.color} />
                </View>
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadTitle}>{option.title}</Text>
                  <Text style={styles.uploadDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {isUploading && (
            <View style={styles.uploadingIndicator}>
              <Text style={styles.uploadingText}>Processing document with OCR...</Text>
            </View>
          )}
        </View>

        {/* Records List */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionTitle}>Medical Records</Text>
            <Text style={styles.recordsCount}>{mockRecords.length} records</Text>
          </View>

          <View style={styles.recordsList}>
            {mockRecords.map((record) => (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordIcon}>
                    {record.type === 'image' ? (
                      <ImageIcon size={20} color="#10B981" />
                    ) : (
                      <FileText size={20} color="#8B5CF6" />
                    )}
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <View style={styles.recordMeta}>
                      <Calendar size={12} color="#6B7280" />
                      <Text style={styles.recordDate}>{record.date}</Text>
                    </View>
                  </View>
                  <View style={styles.recordActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Eye size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Download size={16} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteRecord(record.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {record.type === 'image' && record.file.startsWith('http') && (
                  <Image source={{ uri: record.file }} style={styles.recordImage} />
                )}

                {record.extractedText && (
                  <View style={styles.extractedTextContainer}>
                    <Text style={styles.extractedTextLabel}>Extracted Text:</Text>
                    <Text style={styles.extractedText}>{record.extractedText}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* OCR Info */}
        <View style={styles.ocrInfoCard}>
          <View style={styles.ocrInfoHeader}>
            <Upload size={24} color="#8B5CF6" />
            <Text style={styles.ocrInfoTitle}>Smart OCR Processing</Text>
          </View>
          <Text style={styles.ocrInfoDescription}>
            Our advanced OCR technology automatically extracts text from your medical documents and images, 
            making them searchable and easily accessible for future reference.
          </Text>
          <View style={styles.ocrFeatures}>
            <Text style={styles.ocrFeature}>✓ Automatic text extraction</Text>
            <Text style={styles.ocrFeature}>✓ Searchable content</Text>
            <Text style={styles.ocrFeature}>✓ Secure cloud storage</Text>
            <Text style={styles.ocrFeature}>✓ Easy sharing with vets</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  uploadSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  uploadOptions: {
    gap: 12,
  },
  uploadOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledOption: {
    opacity: 0.6,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  uploadDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  uploadingIndicator: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadingText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#8B5CF6',
  },
  recordsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsCount: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  recordsList: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recordDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  recordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  extractedTextContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  extractedTextLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  extractedText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  ocrInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  ocrInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ocrInfoTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginLeft: 12,
  },
  ocrInfoDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  ocrFeatures: {
    gap: 6,
  },
  ocrFeature: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#10B981',
  },
  bottomSpacing: {
    height: 20,
  },
  generateButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
      color: '#EF4444',
      textAlign: 'center',
      marginTop: 12,
      padding: 10,
      backgroundColor: '#FEE2E2',
      borderRadius: 8,
  },
  reportContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
  },
  overallStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      gap: 12
  },
  overallStatusTitle: {
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
  },
  overallStatusSummary: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      opacity: 0.9,
  },
  sectionContainer: {
      marginBottom: 12,
  },
  reportItem: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
  },
  reportItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  itemTextContainer: {
      flex: 1,
  },
  reportItemTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      color: '#374151',
  },
  reportItemDescription: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: '#6B7280',
      marginTop: 4
  },
});