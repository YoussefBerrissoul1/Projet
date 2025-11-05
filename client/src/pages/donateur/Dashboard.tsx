import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { TrendingUp, Briefcase, Heart, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function DonateurDashboard() {
  const { user } = useAuthStore();
  const { projects, indicators } = useAppStore();

  const fundedProjects = projects.filter((p) => p.donatorIds.includes(user?.id || ''));
  const fundedIndicators = indicators.filter((i) =>
    fundedProjects.some((p) => p.id === i.projectId)
  );

  const totalBudget = fundedProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = fundedProjects.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = fundedIndicators.length
    ? Math.round(
        fundedIndicators.reduce((sum, ind) => sum + (ind.currentValue / ind.targetValue) * 100, 0) /
          fundedIndicators.length
      )
    : 0;

  const projectsByStatus = [
    { name: 'Active', value: fundedProjects.filter((p) => p.status === 'active').length },
    { name: 'Completed', value: fundedProjects.filter((p) => p.status === 'completed').length },
    { name: 'Planning', value: fundedProjects.filter((p) => p.status === 'planning').length },
  ];

  const COLORS = ['#8B5CF6', '#10B981', '#06B6D4'];

  const budgetData = fundedProjects.map((p) => ({
    name: p.name.substring(0, 10),
    budget: p.budget,
    spent: p.spent,
  }));

  const stats = [
    {
      label: 'Funded Projects',
      value: fundedProjects.length,
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Total Invested',
      value: `$${totalBudget}`,
      icon: Heart,
      color: 'from-red-500 to-red-600',
    },
    {
      label: 'Avg Progress',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <DashboardLayout title="Donateur Dashboard">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={itemVariants}
        >
          {/* Projects by Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Budget Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget vs Spent</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#8B5CF6" name="Budget" />
                <Bar dataKey="spent" fill="#06B6D4" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Impact Summary */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Impact Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Budget Allocated</p>
                <p className="text-2xl font-bold">${totalBudget}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">${totalSpent}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Remaining Budget</p>
                <p className="text-2xl font-bold text-emerald-600">${totalBudget - totalSpent}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
