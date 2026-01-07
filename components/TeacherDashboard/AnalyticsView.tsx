import React, { useState, useEffect, useMemo } from 'react';
import { classService } from '../../services/class/classService';
import type { ClassRoom, StudentEntry } from '../../src/core/types/class';

interface AnalyticsData {
  classrooms: ClassRoom[];
  totalStudents: number;
  totalQuizzes: number;
  averageScore: number;
  activeStudentsThisWeek: number;
  scoreDistribution: { range: string; count: number }[];
  performanceByClass: {
    name: string;
    avgScore: number;
    studentCount: number;
  }[];
}

const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await classService.init();
      const classrooms = await classService.getAllClassRooms();
      const analytics = calculateAnalytics(classrooms);
      setData(analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!data || data.classrooms.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          尚無分析數據
        </h2>
        <p className="text-slate-600">建立班級並新增學生後即可查看學習分析</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="總學生人數" value={data.totalStudents} icon="👥" />
        <StatCard label="總測驗次數" value={data.totalQuizzes} icon="📝" />
        <StatCard
          label="平均分數"
          value={`${data.averageScore.toFixed(1)}%`}
          icon="🎯"
        />
        <StatCard
          label="本週活躍"
          value={data.activeStudentsThisWeek}
          icon="⚡"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            分數分佈
          </h3>
          <ScoreDistributionChart distribution={data.scoreDistribution} />
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            班級表現比較
          </h3>
          <ClassPerformanceChart performance={data.performanceByClass} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          學生排行榜
        </h3>
        <TopStudentsTable classrooms={data.classrooms} />
      </div>
    </div>
  );
};

function calculateAnalytics(classrooms: ClassRoom[]): AnalyticsData {
  const allStudents: StudentEntry[] = classrooms.flatMap(c => c.students);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalStudents = allStudents.length;
  const totalQuizzes = allStudents.reduce((sum, s) => sum + s.totalQuizzes, 0);
  const totalScoreWeight = allStudents.reduce(
    (sum, s) => sum + s.averageScore * s.totalQuizzes,
    0
  );
  const averageScore = totalQuizzes > 0 ? totalScoreWeight / totalQuizzes : 0;

  const activeStudentsThisWeek = allStudents.filter(
    s => new Date(s.lastActivity) >= weekAgo
  ).length;

  const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  const scoreDistribution = scoreRanges.map(range => {
    const [min, max] = range.split('-').map(Number);
    const count = allStudents.filter(
      s => s.totalQuizzes > 0 && s.averageScore >= min && s.averageScore <= max
    ).length;
    return { range, count };
  });

  const performanceByClass = classrooms
    .map(c => {
      const stats = classService.calculateClassRoomStats(c);
      return {
        name: c.name,
        avgScore: stats.averageScore,
        studentCount: c.students.length,
      };
    })
    .filter(p => p.studentCount > 0);

  return {
    classrooms,
    totalStudents,
    totalQuizzes,
    averageScore,
    activeStudentsThisWeek,
    scoreDistribution,
    performanceByClass,
  };
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
}> = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  </div>
);

const ScoreDistributionChart: React.FC<{
  distribution: { range: string; count: number }[];
}> = ({ distribution }) => {
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      {distribution.map(d => (
        <div key={d.range} className="flex items-center gap-3">
          <div className="w-16 text-sm text-slate-600">{d.range}</div>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(d.count / maxCount) * 100}%` }}
            />
          </div>
          <div className="w-8 text-sm text-slate-600 text-right">{d.count}</div>
        </div>
      ))}
    </div>
  );
};

const ClassPerformanceChart: React.FC<{
  performance: { name: string; avgScore: number; studentCount: number }[];
}> = ({ performance }) => {
  if (performance.length === 0) {
    return <p className="text-slate-500 text-center py-4">尚無班級數據</p>;
  }

  return (
    <div className="space-y-3">
      {performance.map(p => (
        <div key={p.name} className="flex items-center gap-3">
          <div className="w-24 text-sm text-slate-600 truncate" title={p.name}>
            {p.name}
          </div>
          <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                p.avgScore >= 80
                  ? 'bg-green-500'
                  : p.avgScore >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${p.avgScore}%` }}
            />
          </div>
          <div className="w-12 text-sm text-slate-600 text-right">
            {p.avgScore.toFixed(0)}%
          </div>
        </div>
      ))}
    </div>
  );
};

const TopStudentsTable: React.FC<{ classrooms: ClassRoom[] }> = ({
  classrooms,
}) => {
  const topStudents = useMemo(() => {
    const allStudents = classrooms.flatMap(c =>
      c.students.map(s => ({ ...s, className: c.name }))
    );
    return allStudents
      .filter(s => s.totalQuizzes > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);
  }, [classrooms]);

  if (topStudents.length === 0) {
    return <p className="text-slate-500 text-center py-4">尚無學生測驗數據</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-slate-500 border-b">
            <th className="pb-2 pl-2">排名</th>
            <th className="pb-2">學生</th>
            <th className="pb-2">班級</th>
            <th className="pb-2 text-right">測驗數</th>
            <th className="pb-2 text-right pr-2">平均分</th>
          </tr>
        </thead>
        <tbody>
          {topStudents.map((student, idx) => (
            <tr
              key={student.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="py-3 pl-2">
                {idx < 3 ? (
                  <span className="text-xl">{['🥇', '🥈', '🥉'][idx]}</span>
                ) : (
                  <span className="text-slate-500">{idx + 1}</span>
                )}
              </td>
              <td className="py-3 font-medium text-slate-800">
                {student.name}
              </td>
              <td className="py-3 text-slate-600">{student.className}</td>
              <td className="py-3 text-right text-slate-600">
                {student.totalQuizzes}
              </td>
              <td className="py-3 text-right pr-2">
                <span
                  className={`font-medium ${
                    student.averageScore >= 80
                      ? 'text-green-600'
                      : student.averageScore >= 60
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {student.averageScore.toFixed(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsView;
