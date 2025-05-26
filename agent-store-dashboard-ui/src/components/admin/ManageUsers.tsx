import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  Settings,
  Bot
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";
import apiClient from '@/lib/apiClient';
import { UserDto, UserCreateRequest, UserUpdateRequest, RoleDto } from '@/types/user';
import { AgentDto } from '@/types/agent';
import UserFormModal from './UserFormModal';
import UserAgentAccessModal from './UserAgentAccessModal';
import { useAuth } from '@/contexts/AuthContext';

// API Functions
const fetchUsers = async (): Promise<UserDto[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

const fetchAgents = async (): Promise<AgentDto[]> => {
  const response = await apiClient.get('/agents');
  return response.data;
};

const fetchRoles = async (): Promise<RoleDto[]> => {
  const response = await apiClient.get('/users/roles');
  return response.data;
};

const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

const createUser = async (userData: UserCreateRequest): Promise<UserDto> => {
  const response = await apiClient.post('/users', userData, {
    params: { password: userData.password }
  });
  return response.data;
};

const updateUser = async (id: number, userData: UserUpdateRequest): Promise<UserDto> => {
  const response = await apiClient.put(`/users/${id}`, userData);
  return response.data;
};

const assignRolesToUser = async (userId: number, roleNames: string[]): Promise<UserDto> => {
  const response = await apiClient.put(`/users/${userId}/roles`, { roles: roleNames });
  return response.data;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isAgentAccessOpen, setIsAgentAccessOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const { user: currentUser } = useAuth();

  // Queries
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersErrorData } = useQuery<UserDto[], Error>({ 
    queryKey: ['users'], 
    queryFn: fetchUsers 
  });

  const { data: agents } = useQuery<AgentDto[], Error>({ 
    queryKey: ['agents'], 
    queryFn: fetchAgents 
  });

  const { data: roles } = useQuery<RoleDto[], Error>({ 
    queryKey: ['roles'], 
    queryFn: fetchRoles 
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setIsUserFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setIsUserFormOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const roleAssignMutation = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: number; roleNames: string[] }) => 
      assignRolesToUser(userId, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Roles updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update roles');
    },
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteUser = (user: UserDto) => {
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleEditUser = (user: UserDto) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleManageAgentAccess = (user: UserDto) => {
    setSelectedUser(user);
    setIsAgentAccessOpen(true);
  };

  const toggleUserRole = (user: UserDto, roleName: string) => {
    // Prevent admins from removing their own admin role
    if (currentUser && currentUser.id === user.id && roleName === 'ROLE_ADMIN' && user.roles.includes('ROLE_ADMIN')) {
      toast.error('You cannot remove your own admin role');
      return;
    }
    
    const currentRoles = user.roles;
    const newRoles = currentRoles.includes(roleName)
      ? currentRoles.filter(role => role !== roleName)
      : [...currentRoles, roleName];
    
    roleAssignMutation.mutate({ userId: user.id, roleNames: newRoles });
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'ROLE_VIP':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800';
      case 'ROLE_USER':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Users</h2>
          <p className="text-muted-foreground">Add, edit, and manage user accounts and permissions</p>
        </div>
        <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-md border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredUsers?.length || 0} users found
          </div>
        </div>

        {usersLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading users...</span>
          </div>
        )}

        {usersError && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold mr-2"><AlertCircle className="inline h-5 w-5 mr-1"/>Error:</strong>
            <span className="block sm:inline">{usersErrorData?.message || 'Could not fetch users.'}</span>
          </div>
        )}

        {!usersLoading && !usersError && (
          <div className="space-y-4">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="bg-muted/50 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.enabled 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          }`}>
                            {user.enabled ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Role Management */}
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {roles?.map((role) => {
                            const isCurrentUserAdminRole = currentUser && currentUser.id === user.id && role.name === 'ROLE_ADMIN' && user.roles.includes('ROLE_ADMIN');
                            const isDisabled = roleAssignMutation.isPending || isCurrentUserAdminRole;
                            
                            return (
                              <button
                                key={role.name}
                                onClick={() => toggleUserRole(user, role.name)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  user.roles.includes(role.name)
                                    ? getRoleColor(role.name)
                                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                                } ${isCurrentUserAdminRole ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={isDisabled}
                                title={isCurrentUserAdminRole ? 'You cannot remove your own admin role' : ''}
                              >
                                {user.roles.includes(role.name) ? (
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <Shield className="h-3 w-3 mr-1" />
                                )}
                                {role.name.replace('ROLE_', '')}
                              </button>
                            );
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Click to toggle roles
                          {currentUser && filteredUsers?.some(u => u.id === currentUser.id && u.roles.includes('ROLE_ADMIN')) && (
                            <div className="text-orange-600 dark:text-orange-400 mt-1">
                              Note: You cannot remove your own admin role
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageAgentAccess(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          Agents
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Agent Access Summary */}
                  {user.accessibleAgents && user.accessibleAgents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Has access to {user.accessibleAgents.length} agent(s)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No users found{searchQuery && ' matching your search'}.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        roles={roles || []}
        onSubmit={(userData) => {
          if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data: userData });
          } else {
            createMutation.mutate(userData as UserCreateRequest);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Agent Access Modal */}
      <UserAgentAccessModal
        isOpen={isAgentAccessOpen}
        onClose={() => {
          setIsAgentAccessOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        agents={agents || []}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
    </div>
  );
} 