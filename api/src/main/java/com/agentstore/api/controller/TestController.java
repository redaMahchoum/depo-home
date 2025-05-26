package com.agentstore.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/password")
    public ResponseEntity<Map<String, Object>> testPassword(@RequestParam String password) {
        SCryptPasswordEncoder encoder = new SCryptPasswordEncoder(
            16384,     // cpuCost (N)
            8,         // memoryCost (r)
            1,         // parallelization (p)
            32,        // keyLength
            64         // saltLength
        );
        
        // Generate a hash for the provided password
        String newHash = encoder.encode(password);
        
        // Verify that the password matches the hash
        boolean matches = encoder.matches(password, newHash);
        
        Map<String, Object> response = new HashMap<>();
        response.put("rawPassword", password);
        response.put("scryptHash", newHash);
        response.put("matches", matches);
        
        return ResponseEntity.ok(response);
    }
} 