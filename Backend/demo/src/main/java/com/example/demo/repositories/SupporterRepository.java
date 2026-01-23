package com.example.demo.repositories;


import com.example.demo.models.Supporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SupporterRepository extends JpaRepository<Supporter, Long> {
    
    Optional<Supporter> findByEmail(String email);
    List<Supporter> findByCountry(String country);
}
