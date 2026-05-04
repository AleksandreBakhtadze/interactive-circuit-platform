package com.example.circuit_simulator.repository;

import com.example.circuit_simulator.model.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    Optional<Component> findByName(String name);
    List<Component> findByType(String type);
}
