import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Bot, Loader2, AlertCircle, Plus, Edit, Trash2, ExternalLink, List, Grid3X3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { AgentDto } from '@/types/agent';

// Function to fetch agents
const fetchAgents = async (): Promise<AgentDto[]> => {
  const response = await apiClient.get('/agents');
  return response.data;
};

// Function to delete agent
const deleteAgent = async (id: string): Promise<void> => {
  await apiClient.delete(`/agents/${id}`);
};

export default function ManageAgents() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Use react-query to fetch agents
  const { data: agents, isLoading, isError, error } = useQuery<AgentDto[], Error>({ 
    queryKey: ['agents'], 
    queryFn: fetchAgents 
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete agent');
    },
  });

  // Filter agents based on search query
  const filteredAgents = agents?.filter(agent => 
    agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAgent = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Agents</h2>
          <p className="text-muted-foreground">Create, edit, and manage AI agents in your store</p>
        </div>
        <Link to="/admin/agents/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border p-6">
        <div className="flex justify-between items-center mb-6">
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
                  <div key={agent.id} className="bg-muted/50 rounded-xl shadow-sm overflow-hidden border border-border">
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl text-card-foreground">{agent.title}</h3>
                          <div className="flex gap-2">
                            {agent.linkUrl && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                onClick={() => window.open(agent.linkUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            )}
                            <Link to={`/admin/agents/edit/${agent.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteAgent(agent.id, agent.title)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{agent.description}</p>
                        {agent.port && (
                          <p className="text-sm text-muted-foreground mb-2">Port: {agent.port}</p>
                        )}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>ID: {agent.id}</span>
                          <span>Created: {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={agent.id} className="bg-muted/50 rounded-xl shadow-sm overflow-hidden border border-border">
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
                        onClick={() => window.open(agent.linkUrl, '_blank')}
                      >
                        {agent.title}
                      </h3>
                      {agent.port && (
                        <p className="text-sm text-muted-foreground mb-3">Port: {agent.port}</p>
                      )}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-muted-foreground/70">ID: {agent.id.slice(0, 8)}...</span>
                        <span className="text-xs text-muted-foreground/70">
                          {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex gap-1">
                          <Link to={`/admin/agents/edit/${agent.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteAgent(agent.id, agent.title)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
      </div>
    </div>
  );
} 