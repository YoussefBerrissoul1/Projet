import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import {
  Briefcase,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  History,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useRoute, useLocation } from 'wouter';
import { IndicatorEntryFormModal } from '@/components/IndicatorEntryFormModal';
import { useState } from 'react';
import { Indicator } from '@/types/project';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface IndicatorChartProps {
  indicator: Indicator;
}

const IndicatorChart = ({ indicator }: IndicatorChartProps) => {
  const { getEntriesByIndicator } = useAppStore();
  const entries = getEntriesByIndicator(indicator.id).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  const chartData = entries.map((entry) => ({
    date: format(entry.createdAt, 'MMM dd'),
    value: entry.value,
  }));

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-2">{indicator.name}</h4>
      <p className="text-sm text-muted-foreground mb-4">
        Target: {indicator.targetValue} {indicator.unit}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8B5CF6" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default function ChefProjectDetails() {
  const [match, params] = useRoute('/chef/projects/:id');
  const [, navigate] = useLocation();
  const { getProjectById, getIndicatorsByProject } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(
    null
  );

  if (!match || !params?.id) {
    return (
      <DashboardLayout title="Project Details">
        <div className="text-center py-10">Project not found.</div>
      </DashboardLayout>
    );
  }

  const project = getProjectById(params.id);
  const indicators = getIndicatorsByProject(params.id);

  if (!project) {
    return (
      <DashboardLayout title="Project Details">
        <div className="text-center py-10">Project not found.</div>
      </DashboardLayout>
    );
  }

  const handleUpdateValue = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsModalOpen(true);
  };

  const avgProgress = indicators.length
    ? Math.round(
        indicators.reduce(
          (sum, ind) => sum + (ind.currentValue / ind.targetValue) * 100,
          0
        ) / indicators.length
      )
    : 0;

  return (
    <DashboardLayout title={`Project: ${project.name}`}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" onClick={() => navigate('/chef/projects')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>

        {/* Project Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200`}
            >
              {project.status}
            </span>
          </div>
          <p className="text-muted-foreground mb-6">{project.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-semibold">${project.budget}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="font-semibold">${project.spent}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">
                  {format(project.startDate, 'MMM dd, yyyy')} -{' '}
                  {format(project.endDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Indicators Section */}
        <h3 className="text-xl font-semibold">Key Indicators ({indicators.length})</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {indicators.map((indicator) => (
            <Card key={indicator.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold">{indicator.name}</h4>
                <span className="text-sm font-medium text-purple-600">
                  {Math.round(
                    (indicator.currentValue / indicator.targetValue) * 100
                  )}
                  %
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {indicator.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Current Value:</span>
                  <span className="font-medium">
                    {indicator.currentValue} {indicator.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Target Value:</span>
                  <span className="font-medium">
                    {indicator.targetValue} {indicator.unit}
                  </span>
                </div>
              </div>

              <div className="w-full bg-border rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (indicator.currentValue / indicator.targetValue) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => handleUpdateValue(indicator)}
                >
                  <TrendingUp className="w-4 h-4" />
                  Update Value
                </Button>
                <Button variant="ghost" size="icon" title="View History">
                  <History className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Indicator History Charts */}
        <h3 className="text-xl font-semibold pt-4">Indicator History</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {indicators.map((indicator) => (
            <IndicatorChart key={indicator.id} indicator={indicator} />
          ))}
        </div>

        {/* File Upload Simulation */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Evidence File Upload (Simulation)</h3>
          <p className="text-muted-foreground mb-4">
            This section simulates the upload of evidence files related to the project's progress.
          </p>
          <Button className="gap-2">
            <FileText className="w-4 h-4" />
            Upload Evidence File
          </Button>
        </Card>
      </motion.div>

      {selectedIndicator && (
        <IndicatorEntryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          indicator={selectedIndicator}
        />
      )}
    </DashboardLayout>
  );
}
