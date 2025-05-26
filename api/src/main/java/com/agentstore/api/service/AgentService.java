package com.agentstore.api.service;

import com.agentstore.api.dto.AgentDto;
import com.agentstore.api.dto.ApiResponse;
import com.agentstore.api.entity.Agent;
import com.agentstore.api.entity.User;
import com.agentstore.api.exception.ResourceNotFoundException;
import com.agentstore.api.repository.AgentRepository;
import com.agentstore.api.repository.UserRepository;
import com.agentstore.api.security.UserDetailsImpl;
import com.agentstore.api.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentService {
    
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all agents based on user's role and permissions
     */
    public List<AgentDto> getAllAgents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Admin and VIP users can see all agents
        if (hasAdminOrVipRole(authentication)) {
            return agentRepository.findAllByOrderByCreatedAtAsc().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }
        
        // Regular users can only see assigned agents
        return agentRepository.findAllByUserIdOrderByCreatedAtAsc(userDetails.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all agents with pagination based on user's role and permissions
     */
    public Page<AgentDto> getAllAgents(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Admin and VIP users can see all agents
        if (hasAdminOrVipRole(authentication)) {
            return agentRepository.findAllByOrderByCreatedAtAsc(pageable)
                    .map(this::convertToDto);
        }
        
        // Regular users can only see assigned agents
        return agentRepository.findAllByUserIdOrderByCreatedAtAsc(userDetails.getId(), pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get agent by ID if user has access
     */
    public AgentDto getAgentById(String id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        
        // Check if user has access to this agent
        if (!hasAccessToAgent(agent)) {
            throw new ResourceNotFoundException("Agent", "id", id);
        }
        
        return convertToDto(agent);
    }
    
    /**
     * Create a new agent (admin only)
     */
    @Transactional
    public AgentDto createAgent(AgentDto agentDto) {
        // Process image data if provided
        String imageData = null;
        String mimeType = null;
        
        if (StringUtils.hasText(agentDto.getImageDataUrl())) {
            String[] imageDataParts = ImageUtil.parseDataUrl(agentDto.getImageDataUrl());
            if (imageDataParts != null) {
                mimeType = imageDataParts[0];
                imageData = imageDataParts[1];
            } else {
                throw new IllegalArgumentException("Invalid image data URL format or unsupported image type");
            }
        } else if (StringUtils.hasText(agentDto.getImageData()) && StringUtils.hasText(agentDto.getMimeType())) {
            if (ImageUtil.isValidImage(agentDto.getImageData(), agentDto.getMimeType())) {
                imageData = agentDto.getImageData();
                mimeType = agentDto.getMimeType();
            } else {
                throw new IllegalArgumentException("Invalid image data or unsupported image type");
            }
        }
        
        Agent agent = Agent.builder()
                .id(agentDto.getId())
                .title(agentDto.getTitle())
                .description(agentDto.getDescription())
                .imageData(imageData)
                .mimeType(mimeType)
                .linkUrl(agentDto.getLinkUrl())
                .port(agentDto.getPort())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Agent savedAgent = agentRepository.save(agent);
        return convertToDto(savedAgent);
    }
    
    /**
     * Update an agent (admin only)
     */
    @Transactional
    public AgentDto updateAgent(String id, AgentDto agentDto) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        
        agent.setTitle(agentDto.getTitle());
        agent.setDescription(agentDto.getDescription());
        agent.setLinkUrl(agentDto.getLinkUrl());
        agent.setPort(agentDto.getPort());
        
        // Process image data if provided
        if (StringUtils.hasText(agentDto.getImageDataUrl())) {
            String[] imageDataParts = ImageUtil.parseDataUrl(agentDto.getImageDataUrl());
            if (imageDataParts != null) {
                agent.setMimeType(imageDataParts[0]);
                agent.setImageData(imageDataParts[1]);
            } else {
                throw new IllegalArgumentException("Invalid image data URL format or unsupported image type");
            }
        } else if (StringUtils.hasText(agentDto.getImageData()) && StringUtils.hasText(agentDto.getMimeType())) {
            if (ImageUtil.isValidImage(agentDto.getImageData(), agentDto.getMimeType())) {
                agent.setImageData(agentDto.getImageData());
                agent.setMimeType(agentDto.getMimeType());
            } else {
                throw new IllegalArgumentException("Invalid image data or unsupported image type");
            }
        }
        
        agent.setUpdatedAt(LocalDateTime.now());
        
        Agent updatedAgent = agentRepository.save(agent);
        return convertToDto(updatedAgent);
    }
    
    /**
     * Delete an agent (admin only)
     */
    @Transactional
    public ApiResponse<String> deleteAgent(String id) {
        if (!agentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Agent", "id", id);
        }
        
        agentRepository.deleteById(id);
        return ApiResponse.success("Agent deleted successfully");
    }
    
    /**
     * Assign agent access to a user
     */
    @Transactional
    public ApiResponse<String> assignAgentToUser(Long userId, String agentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        
        // Add agent to user's accessible agents
        if (user.getAccessibleAgents() == null) {
            user.setAccessibleAgents(new HashSet<>());
        }
        user.getAccessibleAgents().add(agent);
        userRepository.save(user);
        
        return ApiResponse.success("Agent access assigned to user successfully");
    }
    
    /**
     * Revoke agent access from a user
     */
    @Transactional
    public ApiResponse<String> revokeAgentFromUser(Long userId, String agentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        
        // Remove agent from user's accessible agents
        if (user.getAccessibleAgents() != null) {
            user.getAccessibleAgents().remove(agent);
            userRepository.save(user);
        }
        
        return ApiResponse.success("Agent access revoked from user successfully");
    }
    
    /**
     * Convert Agent entity to AgentDto
     */
    private AgentDto convertToDto(Agent agent) {
        AgentDto dto = AgentDto.builder()
                .id(agent.getId())
                .title(agent.getTitle())
                .description(agent.getDescription())
                .imageData(agent.getImageData())
                .mimeType(agent.getMimeType())
                .linkUrl(agent.getLinkUrl())
                .port(agent.getPort())
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
        
        // Create imageDataUrl for frontend if image data exists
        if (StringUtils.hasText(agent.getImageData()) && StringUtils.hasText(agent.getMimeType())) {
            dto.setImageDataUrl(ImageUtil.createDataUrl(agent.getMimeType(), agent.getImageData()));
        }
        
        return dto;
    }
    
    /**
     * Check if current user has admin or VIP role
     */
    private boolean hasAdminOrVipRole(Authentication authentication) {
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")) ||
                authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_VIP"));
    }
    
    /**
     * Check if current user has access to specific agent
     */
    private boolean hasAccessToAgent(Agent agent) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Admin and VIP users can access all agents
        if (hasAdminOrVipRole(authentication)) {
            return true;
        }
        
        // For regular users, check if they have explicit access
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // Check if user has explicit access to this agent
        for (User user : agent.getUsersWithAccess()) {
            if (user.getId().equals(userId)) {
                return true;
            }
        }
        
        return false;
    }
} 