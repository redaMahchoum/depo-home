export interface UserDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
  accessibleAgents?: string[]; // Agent IDs that user has access to
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  enabled?: boolean;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  enabled: boolean;
  roles: string[];
}

export interface RoleDto {
  id: number;
  name: string;
}

export interface UserAgentAssignment {
  userId: number;
  agentIds: string[];
} 