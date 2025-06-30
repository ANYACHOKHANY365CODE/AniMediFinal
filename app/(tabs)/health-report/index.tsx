import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { usePet } from '../../contexts/PetContext';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';

const HealthReportScreen = () => {
  const { activePet, medicalRecords, reminders } = usePet();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied. Location is required for environmental analysis.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleGenerateReport = async () => {
    if (!activePet) {
      setError('An active pet is required to generate a report.');
      return;
    }
    if (!location) {
      setError('Could not determine your location. Please ensure location services are enabled.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('http://localhost:3000/api/generate-health-report', {
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
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderReportSection = (title: string, items: any[], color: string) => (
    <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        {items.map((item, index) => {
            const Icon = LucideIcons[item.icon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;
            return (
                <View key={index} style={styles.reportItem}>
                    <View style={[styles.itemIconContainer, { backgroundColor: `${color}20` }]}>
                        <Icon size={24} color={color} />
                    </View>
                    <View style={styles.itemTextContainer}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemDescription}>{item.description}</Text>
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

  return (
    <LinearGradient colors={['#F4F1FE', '#FFFFFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Health Report</Text>
        </View>

        {activePet ? (
          <View style={styles.content}>
            <View style={styles.petIdCard}>
                {activePet.avatar_url ? (
                    <Image source={{ uri: activePet.avatar_url }} style={styles.petPhoto} />
                ) : (
                    <View style={styles.petPhotoPlaceholder}>
                        <Text style={styles.petEmoji}>{activePet.type === 'dog' ? '🐕' : '🐱'}</Text>
                    </View>
                )}
                <View>
                    <Text style={styles.petName}>{activePet.name}</Text>
                    <Text style={styles.petBreed}>{activePet.breed}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateReport} disabled={isLoading || !location}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <LucideIcons.Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Generate Health Report</Text>
                </>
              )}
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {report && (
              <View style={styles.reportContainer}>
                {report.overallStatus && (() => {
                    const Icon = LucideIcons[report.overallStatus.icon as keyof typeof LucideIcons] || LucideIcons.ShieldQuestion;
                    return (
                        <View style={[styles.overallStatus, { backgroundColor: `${getStatusColor(report.overallStatus.level)}20` }]}>
                            <Icon size={32} color={getStatusColor(report.overallStatus.level)}/>
                            <View style={{ flex: 1}}>
                                <Text style={[styles.overallStatusTitle, { color: getStatusColor(report.overallStatus.level) }]}>{report.overallStatus.level} Health</Text>
                                <Text style={[styles.overallStatusSummary, { color: getStatusColor(report.overallStatus.level) }]}>{report.overallStatus.summary}</Text>
                            </View>
                        </View>
                    );
                })()}
                {report.potentialRisks && renderReportSection("Potential Risks", report.potentialRisks, '#EF4444')}
                {report.recommendations && renderReportSection("Recommendations", report.recommendations, '#10B981')}
              </View>
            )}

          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <LucideIcons.ShieldQuestion size={64} color="#C4B5FD" />
            <Text style={styles.emptyStateTitle}>No Active Pet</Text>
            <Text style={styles.emptyStateText}>
              Please select or create a pet profile to generate a report.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
        textAlign: 'center'
    },
    content: {
        paddingHorizontal: 16,
    },
    petIdCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    petPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    petPhotoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    petEmoji: {
        fontSize: 30,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    petBreed: {
        fontSize: 14,
        color: '#6B7280',
    },
    generateButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        opacity: 1,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
    },
    reportContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
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
        fontWeight: 'bold',
    },
    overallStatusSummary: {
        fontSize: 14,
        opacity: 0.9,
    },
    sectionContainer: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    reportItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemIconContainer: {
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
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    itemDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 100,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
});

export default HealthReportScreen; 