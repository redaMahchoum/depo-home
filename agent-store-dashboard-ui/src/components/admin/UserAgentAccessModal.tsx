import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserDto } from '@/types/user';
import { AgentDto } from '@/types/agent';
import { 
  Loader2, 
  Bot, 
  Search, 
  Check, 
  X, 
  Plus, 
  Minus,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';

interface UserAgentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
  agents: AgentDto[];
  onUpdate: () => void;
}

// API function to update user agent access
const updateUserAgentAccess = async (userId: number, agentIds: string[]): Promise<void> => {
  await apiClient.put(`/users/${userId}/agent-access`, { agentIds });
};

export default function UserAgentAccessModal({
  isOpen,
  onClose,
  user,
  agents,
  onUpdate
}: UserAgentAccessModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && isOpen) {
      setSelectedAgentIds(user.accessibleAgents || []);
    }
  }, [user, isOpen]);

  const updateAccessMutation = useMutation({
    mutationFn: ({ userId, agentIds }: { userId: number; agentIds: string[] }) => 
      updateUserAgentAccess(userId, agentIds),
    onSuccess: () => {
      toast.success('Agent access updated successfully');
      onUpdate();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update agent access');
    },
  });

  const filteredAgents = agents.filter(agent => 
    agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAgentAccess = (agentId: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAgentIds(filteredAgents.map(agent => agent.id));
  };

  const handleDeselectAll = () => {
    setSelectedAgentIds([]);
  };

  const handleSave = () => {
    if (!user) return;
    updateAccessMutation.mutate({ userId: user.id, agentIds: selectedAgentIds });
  };

  const selectedCount = selectedAgentIds.length;
  const totalCount = agents.length;

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1070px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Manage Agent Access for {user.username}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">
                  User: <span className="font-medium">{user.username}</span> ({user.email})
                </p>
                <p className="text-sm text-neutral-600">
                  Access: <span className="font-medium">{selectedCount} of {totalCount} agents</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedCount === totalCount}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedCount === 0}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Agent List */}
          <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
            {filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                    onClick={() => toggleAgentAccess(agent.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center flex-shrink-0">
                        {agent.imageDataUrl ? (
                          <img 
                            src={agent.imageDataUrl} 
                            alt={agent.title} 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        ) : (
                          <Bot className="text-white h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-neutral-800 truncate">{agent.title}</h4>
                        <p className="text-sm text-neutral-600 truncate">{agent.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {agent.port && (
                            <Badge variant="outline" className="text-xs">
                              Port: {agent.port}
                            </Badge>
                          )}
                          <span className="text-xs text-neutral-500">
                            ID: {agent.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {agent.linkUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(agent.linkUrl, '_blank');
                          }}
                          className="text-neutral-500 hover:text-neutral-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-neutral-300'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No agents found{searchQuery && ' matching your search'}.</p>
              </div>
            )}
          </div>

          {/* Selected Agents Summary */}
          {selectedCount > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Selected Agents ({selectedCount}):
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedAgentIds.map(agentId => {
                  const agent = agents.find(a => a.id === agentId);
                  return agent ? (
                    <Badge key={agentId} variant="secondary" className="text-xs">
                      {agent.title}
                      <button
                        onClick={() => toggleAgentAccess(agentId)}
                        className="ml-1 hover:bg-neutral-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateAccessMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateAccessMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateAccessMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 