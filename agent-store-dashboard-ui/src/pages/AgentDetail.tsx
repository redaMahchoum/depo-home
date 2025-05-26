import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ChevronLeft, Bot, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { AgentDto } from '@/types/agent';
import { AxiosError } from 'axios';

// Fetch function for a single agent
const fetchAgentById = async (id: string): Promise<AgentDto> => {
  const response = await apiClient.get(`/agents/${id}`);
  return response.data as AgentDto;
};

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const { data: agent, isLoading, isError, error } = useQuery<AgentDto, AxiosError>( {
      queryKey: ['agent', id],
      queryFn: () => {
        if (!id) throw new Error('Agent ID is required');
        return fetchAgentById(id);
      },
      enabled: !!id,
      retry: (failureCount, err) => {
        if (err.response?.status === 403 || err.response?.status === 404) {
          return false;
        }
        return failureCount < 3;
      },
    }
  );
  
  useEffect(() => {
    if (isError && error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        toast.error('Access Denied: You do not have permission to view this agent or it does not exist.');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isError, error, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <Bot className="text-2xl mr-3" />
            <h1 className="text-xl">Agent Store</h1>
          </Link>
          <div className="flex items-center gap-2">
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
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading agent details...</span>
          </div>
        )}

        {/* Error State (excluding 403/404 handled by useEffect) */}
        {isError && error && error.response?.status !== 403 && error.response?.status !== 404 && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold mr-2"><AlertCircle className="inline h-5 w-5 mr-1"/>Error:</strong>
            <span className="block sm:inline">{error.message || 'Could not fetch agent details.'}</span>
          </div>
        )}

        {/* Success State - Display Agent Details - Explicitly check agent is defined */}
        {!isLoading && !isError && agent && (
          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
            <div className="md:flex">
               <div className="md:w-80 lg:w-96 bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden"> 
                  {agent.imageDataUrl ? (
                    <img 
                      src={agent.imageDataUrl} 
                      alt={agent.title} 
                      className="w-full h-64 md:h-80 lg:h-96 object-cover" 
                    />
                  ) : (
                    <div className="w-full h-64 md:h-80 lg:h-96 flex items-center justify-center">
                      <Bot className="text-muted-foreground h-24 w-24" />
                    </div>
                  )}
                </div>
                <div className="flex-grow p-8">
                   <h1 className="text-3xl font-semibold text-card-foreground mb-3">{agent.title}</h1>
                  <p className="text-muted-foreground mb-4 text-lg">{agent.description}</p>
                  {agent.port && (
                    <p className="text-sm text-muted-foreground mb-6">Port: {agent.port}</p>
                  )}
                   
                  {/* Agent Actions */}
                  {agent.linkUrl && (
                    <div className="mb-6">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open(agent.linkUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Agent
                      </Button>
                    </div>
                  )}
                   
                  {/* Placeholder for Agent Interaction/Controls */} 
                  <div className="border-t border-border pt-6">
                     <h2 className="text-xl font-medium text-card-foreground mb-4">Interact with Application</h2> 
                     {/* Add agent interaction components here (e.g., chat interface, buttons) */} 
                    <div className="text-center text-muted-foreground py-10 bg-muted rounded-md"> 
                       <p>App interaction area (coming soon)</p> 
                     </div> 
                  </div> 
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
