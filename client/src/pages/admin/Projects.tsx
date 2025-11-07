import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { mockProjects } from '@/data/mockData';
import { ProjectFormModal } from '@/components/ProjectFormModal';
import { Project } from '@/types/project';
import { format } from 'date-fns';

export default function AdminProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState(mockProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleAddProject = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (project: Project) => {
    if (projectToEdit) {
      // Edit
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
    } else {
      // Create
      setProjects([...projects, project]);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200',
      planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    };
    return colors[status] || '';
  };

  return (
    <DashboardLayout title="Project Management">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button className="gap-2" onClick={handleAddProject}>
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold line-clamp-2">{project.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Budget */}
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Budget
                    </span>
                    <span className="text-sm font-semibold">${project.budget}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ${project.spent} spent ({Math.round((project.spent / project.budget) * 100)}%)
                  </p>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(project.startDate, 'MMM dd')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(project.endDate, 'MMM dd')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
	                  <Button variant="ghost" size="sm" className="flex-1 gap-1" onClick={() => handleEditProject(project)}>
	                    <Edit2 className="w-4 h-4" />
	                    Edit
	                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Projects</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {projects.filter((p) => p.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-bold">${projects.reduce((sum, p) => sum + p.budget, 0)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-600">${projects.reduce((sum, p) => sum + p.spent, 0)}</p>
          </Card>
        </div>
	      </motion.div>
        <ProjectFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectToEdit={projectToEdit}
          onSave={handleSaveProject}
        />
	    </DashboardLayout>
	  );
	}
