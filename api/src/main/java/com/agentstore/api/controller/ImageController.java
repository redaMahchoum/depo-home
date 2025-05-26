package com.agentstore.api.controller;

import com.agentstore.api.entity.Agent;
import com.agentstore.api.exception.ResourceNotFoundException;
import com.agentstore.api.repository.AgentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Tag(name = "Image Management", description = "Image Management API")
@SecurityRequirement(name = "Bearer Authentication")
public class ImageController {
    
    private final AgentRepository agentRepository;
    
    @GetMapping("/agents/{agentId}")
    @Operation(summary = "Get agent image as raw binary data")
    public ResponseEntity<byte[]> getAgentImage(@PathVariable String agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        
        if (!StringUtils.hasText(agent.getImageData()) || !StringUtils.hasText(agent.getMimeType())) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            byte[] imageBytes = Base64.getDecoder().decode(agent.getImageData());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(agent.getMimeType()));
            headers.setContentLength(imageBytes.length);
            headers.setCacheControl("public, max-age=3600"); // Cache for 1 hour
            
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/agents/{agentId}/data-url")
    @Operation(summary = "Get agent image as data URL")
    public ResponseEntity<String> getAgentImageDataUrl(@PathVariable String agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        
        if (!StringUtils.hasText(agent.getImageData()) || !StringUtils.hasText(agent.getMimeType())) {
            return ResponseEntity.notFound().build();
        }
        
        String dataUrl = String.format("data:%s;base64,%s", agent.getMimeType(), agent.getImageData());
        return ResponseEntity.ok(dataUrl);
    }
} 