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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserDto, UserCreateRequest, UserUpdateRequest, RoleDto } from '@/types/user';
import { Loader2, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserDto | null;
  roles: RoleDto[];
  onSubmit: (userData: UserCreateRequest | UserUpdateRequest) => void;
  isLoading: boolean;
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
  roles,
  onSubmit,
  isLoading
}: UserFormModalProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    enabled: true,
    roles: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        enabled: user.enabled,
        roles: user.roles
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        enabled: true,
        roles: ['ROLE_USER'] // Default role
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required for new users';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (user) {
      // Update user - only send changed fields
      const updateData: UserUpdateRequest = {};
      if (formData.username !== user.username) updateData.username = formData.username;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.enabled !== user.enabled) updateData.enabled = formData.enabled;
      
      onSubmit(updateData);
    } else {
      // Create new user
      const createData: UserCreateRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        enabled: formData.enabled,
        roles: formData.roles
      };
      
      onSubmit(createData);
    }
  };

  const toggleRole = (roleName: string) => {
    // Prevent admins from removing their own admin role
    if (currentUser && user && currentUser.id === user.id && roleName === 'ROLE_ADMIN' && formData.roles.includes('ROLE_ADMIN')) {
      toast.error('You cannot remove your own admin role');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleName)
        ? prev.roles.filter(role => role !== roleName)
        : [...prev.roles, roleName]
    }));
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'ROLE_VIP':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      case 'ROLE_USER':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={errors.username ? 'border-red-500' : ''}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {user && <span className="text-sm text-neutral-500">(leave blank to keep current)</span>}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={errors.password ? 'border-red-500' : ''}
                placeholder={user ? "Enter new password (optional)" : "Enter password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Enabled Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
            <Label htmlFor="enabled">Account Enabled</Label>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const isCurrentUserAdminRole = currentUser && user && currentUser.id === user.id && role.name === 'ROLE_ADMIN' && formData.roles.includes('ROLE_ADMIN');
                
                return (
                  <button
                    key={role.name}
                    type="button"
                    onClick={() => toggleRole(role.name)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      formData.roles.includes(role.name)
                        ? getRoleColor(role.name)
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    } ${isCurrentUserAdminRole ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isCurrentUserAdminRole}
                    title={isCurrentUserAdminRole ? 'You cannot remove your own admin role' : ''}
                  >
                    {formData.roles.includes(role.name) ? (
                      <ShieldCheck className="h-4 w-4 mr-1" />
                    ) : (
                      <Shield className="h-4 w-4 mr-1" />
                    )}
                    {role.name.replace('ROLE_', '')}
                  </button>
                );
              })}
            </div>
            {errors.roles && (
              <p className="text-sm text-red-600">{errors.roles}</p>
            )}
            <p className="text-sm text-neutral-500">
              Click to toggle roles
              {currentUser && user && currentUser.id === user.id && formData.roles.includes('ROLE_ADMIN') && (
                <span className="block text-orange-600 mt-1">
                  Note: You cannot remove your own admin role
                </span>
              )}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 