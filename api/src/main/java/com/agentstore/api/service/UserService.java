package com.agentstore.api.service;

import com.agentstore.api.dto.ApiResponse;
import com.agentstore.api.dto.RoleDto;
import com.agentstore.api.dto.UserDto;
import com.agentstore.api.dto.UserUpdateRequest;
import com.agentstore.api.entity.Agent;
import com.agentstore.api.entity.Role;
import com.agentstore.api.entity.User;
import com.agentstore.api.exception.ResourceNotFoundException;
import com.agentstore.api.repository.AgentRepository;
import com.agentstore.api.repository.RoleRepository;
import com.agentstore.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return convertToDto(user);
    }
    
    @Transactional
    public UserDto createUser(UserDto userDto, String password) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }
        
        User user = User.builder()
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(password))
                .enabled(userDto.isEnabled())
                .build();
        
        Set<Role> roles = userDto.getRoles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        
        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }
    
    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if (updateRequest.getUsername() != null &&
                !updateRequest.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(updateRequest.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        if (updateRequest.getEmail() != null &&
                !updateRequest.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(updateRequest.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }
        
        if (updateRequest.getUsername() != null) {
            user.setUsername(updateRequest.getUsername());
        }
        
        if (updateRequest.getEmail() != null) {
            user.setEmail(updateRequest.getEmail());
        }
        
        if (updateRequest.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }
        
        if (updateRequest.getEnabled() != null) {
            user.setEnabled(updateRequest.getEnabled());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    @Transactional
    public ApiResponse<String> deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        
        userRepository.deleteById(id);
        return ApiResponse.success("User deleted successfully");
    }
    
    @Transactional
    public UserDto assignRolesToUser(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Set<Role> roles = roleNames.stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        
        user.setRoles(roles);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    @Transactional
    public UserDto updateUserAgentAccess(Long userId, List<String> agentIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Set<Agent> agents = agentIds.stream()
                .map(agentId -> agentRepository.findById(agentId)
                        .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId)))
                .collect(Collectors.toSet());
        
        user.setAccessibleAgents(agents);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(role -> RoleDto.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .build())
                .collect(Collectors.toList());
    }
    
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .accessibleAgents(user.getAccessibleAgents() != null ? 
                        user.getAccessibleAgents().stream()
                                .map(Agent::getId)
                                .collect(Collectors.toList()) : 
                        List.of())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
} 