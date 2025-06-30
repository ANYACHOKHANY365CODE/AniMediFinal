import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Shield, AlertTriangle, CheckCircle, XCircle, Star, Clock, Utensils, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';

interface PetCareTip {
  id: string;
  category: string;
  title: string;
  description: string;
  importance?: string;
  severity?: string;
  icon: any;
}

interface PetCareData {
  dos: PetCareTip[];
  donts: PetCareTip[];
}

const petCareData: { [key: string]: PetCareData } = {
  dog: {
    dos: [
      {
        id: '1',
        category: 'Feeding',
        title: 'Provide Fresh Water Daily',
        description: 'Always ensure your dog has access to clean, fresh water. Change it daily and clean the bowl regularly.',
        importance: 'high',
        icon: Utensils,
      },
      {
        id: '2',
        category: 'Exercise',
        title: 'Daily Exercise Routine',
        description: 'Dogs need at least 30 minutes to 2 hours of exercise daily, depending on their breed and age.',
        importance: 'high',
        icon: Activity,
      },
      {
        id: '3',
        category: 'Health',
        title: 'Regular Vet Checkups',
        description: 'Schedule annual vet visits for vaccinations and health screenings. Puppies and senior dogs may need more frequent visits.',
        importance: 'high',
        icon: Heart,
      },
      {
        id: '4',
        category: 'Grooming',
        title: 'Brush Teeth Regularly',
        description: 'Brush your dog\'s teeth 2-3 times per week to prevent dental disease and maintain oral health.',
        importance: 'medium',
        icon: Shield,
      },
      {
        id: '5',
        category: 'Safety',
        title: 'Use Proper Identification',
        description: 'Ensure your dog wears a collar with ID tags and consider microchipping for permanent identification.',
        importance: 'high',
        icon: Shield,
      },
    ],
    donts: [
      {
        id: '1',
        category: 'Feeding',
        title: 'Never Feed Chocolate',
        description: 'Chocolate contains theobromine, which is toxic to dogs and can cause serious health problems or death.',
        severity: 'critical',
        icon: AlertTriangle,
      },
      {
        id: '2',
        category: 'Safety',
        title: 'Don\'t Leave in Hot Cars',
        description: 'Never leave your dog in a parked car, especially in warm weather. Cars can quickly become deadly hot.',
        severity: 'critical',
        icon: AlertTriangle,
      },
      {
        id: '3',
        category: 'Training',
        title: 'Avoid Punishment-Based Training',
        description: 'Don\'t use physical punishment or yelling. Positive reinforcement is more effective and safer.',
        severity: 'moderate',
        icon: XCircle,
      },
      {
        id: '4',
        category: 'Health',
        title: 'Don\'t Skip Vaccinations',
        description: 'Skipping or delaying vaccinations can leave your dog vulnerable to serious diseases.',
        severity: 'high',
        icon: Shield,
      },
    ],
  },
  cat: {
    dos: [
      {
        id: '1',
        category: 'Litter',
        title: 'Keep Litter Box Clean',
        description: 'Scoop litter daily and change completely weekly. Cats are very particular about cleanliness.',
        importance: 'high',
        icon: Shield,
      },
      {
        id: '2',
        category: 'Health',
        title: 'Regular Vet Checkups',
        description: 'Annual vet visits are essential for vaccinations and early detection of health issues.',
        importance: 'high',
        icon: Heart,
      },
      {
        id: '3',
        category: 'Environment',
        title: 'Provide Vertical Spaces',
        description: 'Cats love to climb and perch. Provide cat trees, shelves, or other vertical spaces.',
        importance: 'medium',
        icon: Activity,
      },
      {
        id: '4',
        category: 'Feeding',
        title: 'Multiple Small Meals',
        description: 'Feed your cat small, frequent meals rather than one large meal to aid digestion.',
        importance: 'medium',
        icon: Utensils,
      },
      {
        id: '5',
        category: 'Safety',
        title: 'Indoor Safety Check',
        description: 'Cat-proof your home by securing toxic plants, chemicals, and small objects that could be swallowed.',
        importance: 'high',
        icon: Shield,
      },
    ],
    donts: [
      {
        id: '1',
        category: 'Feeding',
        title: 'Never Feed Onions or Garlic',
        description: 'Onions and garlic are toxic to cats and can cause anemia and other serious health problems.',
        severity: 'critical',
        icon: AlertTriangle,
      },
      {
        id: '2',
        category: 'Plants',
        title: 'Avoid Toxic Plants',
        description: 'Many common houseplants like lilies, azaleas, and poinsettias are toxic to cats.',
        severity: 'critical',
        icon: AlertTriangle,
      },
      {
        id: '3',
        category: 'Declawing',
        title: 'Don\'t Declaw',
        description: 'Declawing is inhumane and can cause long-term physical and behavioral problems.',
        severity: 'high',
        icon: XCircle,
      },
      {
        id: '4',
        category: 'Milk',
        title: 'Don\'t Give Milk',
        description: 'Most adult cats are lactose intolerant and milk can cause digestive upset.',
        severity: 'moderate',
        icon: XCircle,
      },
    ],
  },
};

// Add a simple Accordion component for collapsible sections
const AccordionSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 12, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', boxShadow: open ? '0 2px 8px rgba(139,92,246,0.06)' : 'none' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ cursor: 'pointer', padding: '12px 18px', fontWeight: 700, color: '#6D28D9', fontSize: 16, borderBottom: open ? '1px solid #E5E7EB' : 'none', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 18 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <div style={{ padding: '12px 18px', fontSize: 15, color: '#374151' }}>{children}</div>}
    </div>
  );
};

const PetCareGuideScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'dos' | 'donts' | 'tips' | 'nutrition' | 'exercise' | 'grooming' | 'health_monitoring' | 'emergency_care' | 'enrichment' | 'seasonal_care' | 'red_flags'>('dos');
  const { activePet } = usePet();
  const navigate = useNavigate();
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const petType = activePet?.type || 'dog';
  const careData = petCareData[petType];
  let careGuide = undefined;
  let careGuideParseError = '';
  let careGuideRaw = '';
  if (activePet?.care_guide) {
    if (typeof activePet.care_guide === 'string') {
      let guideStr = activePet.care_guide.trim();
      careGuideRaw = guideStr;
      // Remove code block markers if present
      if (guideStr.startsWith('```json')) {
        guideStr = guideStr.replace(/^```json/, '').trim();
      }
      if (guideStr.startsWith('```')) {
        guideStr = guideStr.replace(/^```/, '').trim();
      }
      if (guideStr.endsWith('```')) {
        guideStr = guideStr.replace(/```$/, '').trim();
      }
      try {
        careGuide = JSON.parse(guideStr);
      } catch (e: any) {
        careGuideParseError = e.message || 'Invalid care guide JSON.';
        careGuide = undefined;
      }
    } else {
      careGuide = activePet.care_guide;
      // If dos is empty and raw exists, try to parse raw
      const cg: any = careGuide;
      if (cg && Array.isArray(cg.dos) && cg.dos.length === 0 && cg.raw) {
        let rawStr = cg.raw.trim();
        careGuideRaw = rawStr;
        if (rawStr.startsWith('```json')) {
          rawStr = rawStr.replace(/^```json/, '').trim();
        }
        if (rawStr.startsWith('```')) {
          rawStr = rawStr.replace(/^```/, '').trim();
        }
        if (rawStr.endsWith('```')) {
          rawStr = rawStr.replace(/```$/, '').trim();
        }
        try {
          const parsed = JSON.parse(rawStr);
          careGuide = parsed;
        } catch (e: any) {
          careGuideParseError = e.message || 'Invalid care guide JSON.';
        }
      }
    }
  }
  const dos = careGuide?.dos || careData.dos;
  const donts = careGuide?.donts || careData.donts;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  // Helper to render a section as an accordion
  const renderAccordionSection = (title: string, items: any[] = [], defaultOpen = false) => (
    items && items.length > 0 ? (
      <AccordionSection title={title} defaultOpen={defaultOpen}>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {items.map((item: any, idx: number) => (
            typeof item === 'string' ? (
              <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
            ) : (
              <li key={idx} style={{ marginBottom: 6 }}>
                <b>{item.title}</b>{item.description ? ': ' + item.description : ''}
              </li>
            )
          ))}
        </ul>
      </AccordionSection>
    ) : null
  );

  // AI Q&A handler
  const handleAskAI = async () => {
    setAiLoading(true);
    setAiAnswer('');
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiQuestion,
          context: {
            pet: activePet,
            user: {},
            reminders: [],
            medical_records: [],
            logs: []
          }
        })
      });
      const data = await res.json();
      if (data.response) setAiAnswer(data.response);
      else setError('No answer received.');
    } catch (err) {
      setError('Failed to get answer.');
    } finally {
      setAiLoading(false);
    }
  };

  const sectionTabs = [
    { key: 'dos', label: "Do's", data: dos },
    { key: 'donts', label: "Don'ts", data: donts },
    { key: 'tips', label: 'Tips', data: careGuide?.tips || [] },
    { key: 'nutrition', label: 'Nutrition', data: careGuide?.nutrition || [] },
    { key: 'exercise', label: 'Exercise', data: careGuide?.exercise || [] },
    { key: 'grooming', label: 'Grooming', data: careGuide?.grooming || [] },
    { key: 'health_monitoring', label: 'Health Monitoring', data: careGuide?.health_monitoring || [] },
    { key: 'emergency_care', label: 'Emergency Care', data: careGuide?.emergency_care || [] },
    { key: 'enrichment', label: 'Enrichment', data: careGuide?.enrichment || [] },
    { key: 'seasonal_care', label: 'Seasonal Care', data: careGuide?.seasonal_care || [] },
    { key: 'red_flags', label: 'Red Flags', data: careGuide?.red_flags || [] },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      <div style={{ padding: '32px 0 32px 32px', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div
            onClick={() => navigate(-1)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)', cursor: 'pointer', marginRight: 16 }}
          >
            <ArrowLeft size={22} color="#374151" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#374151', fontFamily: 'Nunito', margin: 0, textAlign: 'left' }}>Owner's Manual</h1>
        </div>
        <div style={{ fontSize: 15, color: '#6B7280', marginBottom: 18, textAlign: 'left' }}>
          Comprehensive care guide for <b>{activePet?.name}</b>
        </div>
        {careGuideParseError && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', borderRadius: 8, padding: 14, margin: '18px 0 10px 0', fontSize: 14, fontWeight: 500, textAlign: 'left', width: '90%' }}>
            <b>Error parsing care guide:</b> {careGuideParseError}
            {careGuideRaw && (
              <pre style={{ background: '#fff', color: '#374151', borderRadius: 8, padding: 10, marginTop: 8, maxHeight: 300, overflow: 'auto', fontSize: 13 }}>{careGuideRaw.slice(0, 5000)}</pre>
            )}
          </div>
        )}
        {/* Replace the tab bar with a dropdown */}
        <div style={{ marginBottom: 20, width: 320, maxWidth: '90%' }}>
          <select
            value={selectedTab}
            onChange={e => setSelectedTab(e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #8B5CF6',
              fontWeight: 700,
              fontSize: 15,
              color: '#8B5CF6',
              background: '#fff',
              outline: 'none',
              marginBottom: 4
            }}
          >
            {sectionTabs.map(tab => (
              <option key={tab.key} value={tab.key}>{tab.label}</option>
            ))}
          </select>
        </div>
        <div style={{ width: '100%', marginBottom: 24 }}>
          {sectionTabs.map(tab => (
            selectedTab === tab.key && (
              <AccordionSection key={tab.key} title={tab.label} defaultOpen={true}>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {tab.data && tab.data.length > 0 ? tab.data.map((item: any, idx: number) => (
                    typeof item === 'string' ? (
                      <li key={idx} style={{ marginBottom: 6 }}>{item}</li>
                    ) : (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        <b>{item.title}</b>{item.description ? ': ' + item.description : ''}
                      </li>
                    )
                  )) : <li style={{ color: '#9CA3AF' }}>No data available.</li>}
                </ul>
              </AccordionSection>
            )
          ))}
        </div>
        {/* AI Q&A Section */}
        <div style={{ background: '#fff', borderRadius: 10, padding: 18, marginBottom: 24, boxShadow: '0 2px 8px rgba(139,92,246,0.06)', textAlign: 'left', border: '1px solid #E5E7EB', width: '90%' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>Have more questions?</h3>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 10 }}>Ask our AI Assistant anything about your pet's care. <b>This is not a substitute for professional veterinary advice.</b></p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              placeholder="Type your question..."
              style={{ flex: 1, padding: 9, borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 14 }}
              onKeyDown={e => { if (e.key === 'Enter') handleAskAI(); }}
              disabled={aiLoading}
            />
            <button
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              style={{ padding: '9px 16px', borderRadius: 7, background: '#8B5CF6', color: '#fff', fontWeight: 700, border: 'none', fontSize: 14, cursor: aiLoading ? 'not-allowed' : 'pointer' }}
            >Ask</button>
          </div>
          {aiLoading && <div style={{ color: '#8B5CF6', fontSize: 13 }}>Thinking...</div>}
          {aiAnswer && <div style={{ background: '#F3F4F6', borderRadius: 7, padding: 10, marginTop: 7, color: '#374151', fontSize: 14 }}>{aiAnswer}</div>}
          {error && <div style={{ color: '#EF4444', fontSize: 13, marginTop: 7 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default PetCareGuideScreen;