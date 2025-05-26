import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Search, Bot, Loader2, AlertCircle, ExternalLink, List, Grid3X3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { AgentDto } from '@/types/agent';

// Function to fetch agents
const fetchAgents = async (): Promise<AgentDto[]> => {
  const response = await apiClient.get('/agents');
  return response.data;
};

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Use react-query to fetch agents
  const { data: agents, isLoading, isError, error } = useQuery<AgentDto[], Error>({ 
    queryKey: ['agents'], 
    queryFn: fetchAgents 
  });

  // Filter agents based on search query (client-side for simplicity)
  const filteredAgents = agents?.filter(agent => 
    agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <Bot className="text-2xl mr-3" />
            <h1 className="text-xl">Agent Store</h1>
          </Link>
          <div className="flex items-center gap-2">
            {user?.roles?.includes('ROLE_ADMIN') && (
              <Link 
                to="/admin" 
                className="mr-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200 font-medium"
              >
                Admin Mode
              </Link>
            )}
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
              {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
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

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-foreground">My Apps</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading agents...</span>
          </div>
        )}

        {isError && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold mr-2"><AlertCircle className="inline h-5 w-5 mr-1"/>Error:</strong>
            <span className="block sm:inline">{error?.message || 'Could not fetch agents.'}</span>
          </div>
        )}

        {!isLoading && !isError && (
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {filteredAgents && filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                viewMode === 'list' ? (
                  <Link to={`/agent/${agent.id}`} key={agent.id}>
                    <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border hover:shadow-lg transition-shadow">
                      <div className="md:flex">
                        <div className="md:w-48 bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {agent.imageDataUrl ? (
                            <img 
                              src={agent.imageDataUrl} 
                              alt={agent.title} 
                              className="w-full h-48 md:h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-48 md:h-full flex items-center justify-center">
                              <Bot className="text-muted-foreground h-12 w-12" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow p-6">
                          <h3 className="text-xl text-card-foreground mb-2">{agent.title}</h3>
                          <p className="text-muted-foreground mb-4">{agent.description}</p>
                          {agent.port && (
                            <p className="text-sm text-muted-foreground mb-4">Port: {agent.port}</p>
                          )}
                          <div className="flex justify-end items-center gap-2">
                            <Button>
                              View Details
                            </Button>
                            {agent.linkUrl && (
                              <Button 
                                variant="outline"
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(agent.linkUrl, '_blank');
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div key={agent.id} className="bg-card rounded-xl shadow-md overflow-hidden border border-border hover:shadow-lg transition-shadow">
                    <div className="bg-muted h-48 flex items-center justify-center overflow-hidden">
                      {agent.imageDataUrl ? (
                        <img 
                          src={agent.imageDataUrl} 
                          alt={agent.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Bot className="text-muted-foreground h-12 w-12" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 
                        className="text-lg font-semibold text-card-foreground mb-2 cursor-pointer hover:text-muted-foreground"
                        onClick={() => window.open(`/agent/${agent.id}`, '_blank')}
                      >
                        {agent.title}
                      </h3>
                      {agent.port && (
                        <p className="text-sm text-muted-foreground mb-3">Port: {agent.port}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <Link to={`/agent/${agent.id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                        {agent.linkUrl && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                            onClick={() => window.open(agent.linkUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No agents found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms.' : 'No agents are available at the moment.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
