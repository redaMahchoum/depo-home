package com.agentstore.api.controller;

import com.agentstore.api.dto.ApiResponse;
import com.agentstore.api.dto.RoleDto;
import com.agentstore.api.dto.UserDto;
import com.agentstore.api.dto.UserUpdateRequest;
import com.agentstore.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User Management API")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    @Operation(summary = "Get user by ID (Admin or Same User)")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new user (Admin only)")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto,
                                              @RequestParam String password) {
        return ResponseEntity.ok(userService.createUser(userDto, password));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    @Operation(summary = "Update user (Admin or Same User)")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                              @Valid @RequestBody UserUpdateRequest updateRequest) {
        return ResponseEntity.ok(userService.updateUser(id, updateRequest));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
    
    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign roles to user (Admin only)")
    public ResponseEntity<UserDto> assignRolesToUser(@PathVariable Long userId,
                                                     @RequestBody Map<String, List<String>> request) {
        List<String> roleNames = request.get("roles");
        return ResponseEntity.ok(userService.assignRolesToUser(userId, Set.copyOf(roleNames)));
    }
    
    @PutMapping("/{userId}/agent-access")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user agent access (Admin only)")
    public ResponseEntity<UserDto> updateUserAgentAccess(@PathVariable Long userId,
                                                         @RequestBody Map<String, List<String>> request) {
        List<String> agentIds = request.get("agentIds");
        return ResponseEntity.ok(userService.updateUserAgentAccess(userId, agentIds));
    }
    
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all roles (Admin only)")
    public ResponseEntity<List<RoleDto>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }
} 