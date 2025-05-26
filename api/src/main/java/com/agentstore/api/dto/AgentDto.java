package com.agentstore.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AgentDto {
    
    private String id;
    
    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @NotBlank(message = "Description cannot be blank")
    private String description;
    
    // Base64 encoded image data for storage
    private String imageData;
    
    // MIME type of the image (e.g., "image/jpeg", "image/png")
    private String mimeType;
    
    // This field will be used to send the complete data URL to frontend
    // Format: "data:{mimeType};base64,{imageData}"
    private String imageDataUrl;
    
    private String linkUrl;
    
    @Size(max = 10, message = "Port cannot be more than 10 characters")
    private String port;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
} 