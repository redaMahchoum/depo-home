package com.agentstore.api.utils;

import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;

public class PasswordValidator {
    public static void main(String[] args) {
        // Note: The encoded password from V2__Initial_Data.sql will need to be updated
        // as it's currently using BCrypt format
        String rawPassword = "password";
        
        SCryptPasswordEncoder encoder = new SCryptPasswordEncoder(
            16384,     // cpuCost (N)
            8,         // memoryCost (r)
            1,         // parallelization (p)
            32,        // keyLength
            64         // saltLength
        );
        
        // Generate a new hash from the raw password
        String newHash = encoder.encode(rawPassword);
        
        System.out.println("Raw password: " + rawPassword);
        System.out.println("SCrypt hash: " + newHash);
        
        // Check if raw password matches generated hash
        boolean matches = encoder.matches(rawPassword, newHash);
        System.out.println("Matches: " + matches);
    }
} 