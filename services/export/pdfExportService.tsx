import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import type {
  ExtendedLearningContent,
  LearningObjectiveItem,
  ContentBreakdownItem,
  ConfusingPointItem,
  ClassroomActivity,
} from '../../types';

Font.register({
  family: 'Noto Sans TC',
  src: 'https://fonts.gstatic.com/s/notosanstc/v35/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76Cy_CpOtma3uNQ.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans TC',
    fontSize: 10,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #4F46E5',
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1pt solid #E2E8F0',
  },
  objectiveItem: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  objectiveTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  objectiveDescription: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  contentItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
  },
  contentTopic: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },
  contentDetails: {
    fontSize: 9,
    color: '#475569',
    marginTop: 3,
  },
  confusingItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 4,
    borderLeft: '3pt solid #EF4444',
  },
  confusingPoint: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  confusingClarification: {
    fontSize: 9,
    color: '#7F1D1D',
    marginTop: 3,
  },
  activityItem: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 4,
    borderLeft: '3pt solid #10B981',
  },
  activityTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065F46',
  },
  activityDescription: {
    fontSize: 9,
    color: '#047857',
    marginTop: 3,
  },
  activityMeta: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '1pt solid #E2E8F0',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: '#94A3B8',
  },
});

interface LessonPlanDocumentProps {
  content: ExtendedLearningContent;
  topic: string;
}

const LearningObjectivesSection: React.FC<{
  objectives: LearningObjectiveItem[];
}> = ({ objectives }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>學習目標</Text>
    {objectives.map((obj, i) => (
      <View key={i} style={styles.objectiveItem}>
        <Text style={styles.objectiveTitle}>
          {i + 1}. {obj.objective}
        </Text>
        <Text style={styles.objectiveDescription}>{obj.description}</Text>
        {obj.teachingExample && (
          <Text style={styles.objectiveDescription}>
            範例：{obj.teachingExample}
          </Text>
        )}
      </View>
    ))}
  </View>
);

const ContentBreakdownSection: React.FC<{ items: ContentBreakdownItem[] }> = ({
  items,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>內容分解</Text>
    {items.map((item, i) => (
      <View key={i} style={styles.contentItem}>
        <Text style={styles.contentTopic}>{item.topic}</Text>
        <Text style={styles.contentDetails}>{item.details}</Text>
        {item.teachingExample && (
          <Text style={styles.contentDetails}>
            教學範例：{item.teachingExample}
          </Text>
        )}
      </View>
    ))}
  </View>
);

const ConfusingPointsSection: React.FC<{ points: ConfusingPointItem[] }> = ({
  points,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>容易混淆的知識點</Text>
    {points.map((point, i) => (
      <View key={i} style={styles.confusingItem}>
        <Text style={styles.confusingPoint}>{point.point}</Text>
        <Text style={styles.confusingClarification}>{point.clarification}</Text>
        {point.teachingExample && (
          <Text style={styles.confusingClarification}>
            範例：{point.teachingExample}
          </Text>
        )}
      </View>
    ))}
  </View>
);

const ActivitiesSection: React.FC<{ activities: ClassroomActivity[] }> = ({
  activities,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>課堂活動</Text>
    {activities.map((activity, i) => (
      <View key={i} style={styles.activityItem}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        {activity.objective && (
          <Text style={styles.activityMeta}>目標：{activity.objective}</Text>
        )}
        {activity.timing && (
          <Text style={styles.activityMeta}>時間：{activity.timing}</Text>
        )}
        {activity.materials && (
          <Text style={styles.activityMeta}>材料：{activity.materials}</Text>
        )}
      </View>
    ))}
  </View>
);

const LessonPlanDocument: React.FC<LessonPlanDocumentProps> = ({
  content,
  topic,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{topic}</Text>
        <Text style={styles.subtitle}>
          AI 學習頁面產生器 | 生成日期：{new Date().toLocaleDateString('zh-TW')}
        </Text>
      </View>

      {content.learningObjectives?.length > 0 && (
        <LearningObjectivesSection objectives={content.learningObjectives} />
      )}

      {content.contentBreakdown?.length > 0 && (
        <ContentBreakdownSection items={content.contentBreakdown} />
      )}

      {content.confusingPoints?.length > 0 && (
        <ConfusingPointsSection points={content.confusingPoints} />
      )}

      {content.classroomActivities?.length > 0 && (
        <ActivitiesSection activities={content.classroomActivities} />
      )}

      <Text style={styles.footer}>
        由 AI 學習頁面產生器自動生成 | 財團法人博幼社會福利基金會
      </Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

export const generateLessonPlanPDF = async (
  content: ExtendedLearningContent,
  topic: string
): Promise<Blob> => {
  const doc = <LessonPlanDocument content={content} topic={topic} />;
  return await pdf(doc).toBlob();
};

export const downloadLessonPlanPDF = async (
  content: ExtendedLearningContent,
  topic: string
): Promise<void> => {
  const blob = await generateLessonPlanPDF(content, topic);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${topic}_教案.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
