package com.agentstore.api.repository;

import com.agentstore.api.entity.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentRepository extends JpaRepository<Agent, String> {
    
    // Find all agents associated with a specific user
    @Query("SELECT a FROM Agent a JOIN a.usersWithAccess u WHERE u.id = :userId")
    List<Agent> findAllByUserId(@Param("userId") Long userId);
    
    // Find agents with pagination
    @Query("SELECT a FROM Agent a JOIN a.usersWithAccess u WHERE u.id = :userId")
    Page<Agent> findAllByUserId(@Param("userId") Long userId, Pageable pageable);
    
    // Find by title containing (for search functionality)
    Page<Agent> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Find all agents ordered by creation date (oldest first)
    List<Agent> findAllByOrderByCreatedAtAsc();
    
    // Find all agents associated with a specific user ordered by creation date
    @Query("SELECT a FROM Agent a JOIN a.usersWithAccess u WHERE u.id = :userId ORDER BY a.createdAt ASC")
    List<Agent> findAllByUserIdOrderByCreatedAtAsc(@Param("userId") Long userId);
    
    // Find all agents with pagination ordered by creation date
    Page<Agent> findAllByOrderByCreatedAtAsc(Pageable pageable);
    
    // Find all agents associated with a specific user with pagination ordered by creation date
    @Query("SELECT a FROM Agent a JOIN a.usersWithAccess u WHERE u.id = :userId ORDER BY a.createdAt ASC")
    Page<Agent> findAllByUserIdOrderByCreatedAtAsc(@Param("userId") Long userId, Pageable pageable);
} 