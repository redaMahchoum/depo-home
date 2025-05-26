package com.agentstore.api.controller;

import com.agentstore.api.dto.UserDto;
import com.agentstore.api.dto.UserUpdateRequest;
import com.agentstore.api.security.UserDetailsImpl;
import com.agentstore.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User Profile API")
@SecurityRequirement(name = "Bearer Authentication")
public class ProfileController {
    
    private final UserService userService;
    
    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserDto> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getUserById(userDetails.getId()));
    }
    
    @PutMapping
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserDto> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserUpdateRequest updateRequest) {
        return ResponseEntity.ok(userService.updateUser(userDetails.getId(), updateRequest));
    }
} 