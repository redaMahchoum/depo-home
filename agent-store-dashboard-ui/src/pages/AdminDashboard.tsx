import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bot, Users, Settings, ChevronRight } from 'lucide-react';
import ManageAgents from '@/components/admin/ManageAgents';
import ManageUsers from '@/components/admin/ManageUsers';

type AdminSection = 'overview' | 'agents' | 'users';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Redirect non-admin users
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'agents':
        return <ManageAgents />;
      case 'users':
        return <ManageUsers />;
      default:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
              <p className="text-muted-foreground">Manage your Agent Store platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manage Agents Card */}
              <div 
                className="bg-card rounded-xl shadow-md border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setActiveSection('agents')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Manage Agents</h3>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and manage AI agents in your store. Control agent visibility and configuration.
                </p>
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <span>Manage Agents</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              {/* Manage Users Card */}
              <div 
                className="bg-card rounded-xl shadow-md border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setActiveSection('users')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Manage Users</h3>
                <p className="text-muted-foreground mb-4">
                  Add, edit, and manage user accounts. Assign roles and control agent access permissions.
                </p>
                <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                  <span>Manage Users</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-xl shadow-md border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <div className="text-sm text-muted-foreground">Total Agents</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <Bot className="text-2xl mr-3" />
            <h1 className="text-xl">Agent Store - Admin</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard" 
              className="mr-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200 font-medium"
            >
              User Mode
            </Link>
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <Button
              variant="ghost"
              className="text-primary-foreground hover:bg-primary/80"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-card shadow-md min-h-screen border-r border-border">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'overview'
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveSection('agents')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'agents'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                }`}
              >
                <Bot className="h-5 w-5 mr-3" />
                Manage Agents
              </button>
              
              <button
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'users'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100 font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                }`}
              >
                <Users className="h-5 w-5 mr-3" />
                Manage Users
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 