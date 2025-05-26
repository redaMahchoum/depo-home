import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Bot, Loader2, Upload, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { AgentDto } from '@/types/agent';

// Function to fetch agent by ID
const fetchAgentById = async (id: string): Promise<AgentDto> => {
  const response = await apiClient.get(`/agents/${id}`);
  return response.data;
};

// Function to create agent
const createAgent = async (agentData: Partial<AgentDto>): Promise<AgentDto> => {
  const response = await apiClient.post('/agents', agentData);
  return response.data;
};

// Function to update agent
const updateAgent = async ({ id, ...agentData }: Partial<AgentDto> & { id: string }): Promise<AgentDto> => {
  const response = await apiClient.put(`/agents/${id}`, agentData);
  return response.data;
};

export default function AgentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Redirect non-admin users
  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    linkUrl: '',
    port: '',
    imageDataUrl: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Fetch agent data if editing
  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgentById(id!),
    enabled: isEditing,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent created successfully');
      navigate('/admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create agent');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      toast.success('Agent updated successfully');
      navigate('/admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update agent');
    },
  });

  // Load agent data when editing
  useEffect(() => {
    if (agent) {
      setFormData({
        id: agent.id,
        title: agent.title,
        description: agent.description,
        linkUrl: agent.linkUrl || '',
        port: agent.port || '',
        imageDataUrl: agent.imageDataUrl || '',
      });
      setImagePreview(agent.imageDataUrl || '');
    }
  }, [agent]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        toast.error('Image size must be less than 16MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        setFormData(prev => ({ ...prev, imageDataUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageDataUrl: '' }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.title.length < 3 || formData.title.length > 100) {
      toast.error('Title must be between 3 and 100 characters');
      return;
    }

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      linkUrl: formData.linkUrl.trim() || undefined,
      port: formData.port.trim() || undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ ...submitData, id: id! });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingAgent) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-500 mr-2" />
          <span className="text-neutral-600">Loading agent...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="w-full bg-neutral-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <Bot className="text-2xl mr-3" />
            <h1 className="text-xl">Agent Store - Admin</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center text-neutral-600 hover:text-neutral-800">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Admin Mode
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl text-neutral-800 mb-6">
            {isEditing ? 'Edit Agent' : 'Create New Agent'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent ID (for editing) */}
            {isEditing && (
              <div>
                <Label htmlFor="id">Agent ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  disabled
                  className="bg-neutral-100"
                />
              </div>
            )}

            {/* Agent ID (for creating) */}
            {!isEditing && (
              <div>
                <Label htmlFor="id">Agent ID *</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Enter unique agent ID"
                  required
                />
              </div>
            )}

            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter agent title"
                required
                maxLength={100}
              />
              <p className="text-sm text-neutral-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter agent description"
                required
                rows={4}
              />
            </div>

            {/* Link URL */}
            <div>
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input
                id="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* Port */}
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={formData.port}
                onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                placeholder="3000"
                maxLength={10}
              />
              <p className="text-sm text-neutral-500 mt-1">
                Port number where the agent application is running (e.g., 3000, 8080)
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Agent Image</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center">
                    <Bot className="h-8 w-8 text-neutral-400" />
                  </div>
                )}
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </span>
                    </Button>
                  </Label>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG. Max size: 16MB
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-neutral-800 hover:bg-neutral-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Agent' : 'Create Agent'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 