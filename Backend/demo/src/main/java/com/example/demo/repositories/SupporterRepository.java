package com.example.demo.repositories;

import com.example.demo.models.Supporters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupporterRepository extends JpaRepository<Supporters, Integer> {
    Supporters findById(int id);
    List<Supporters> findAllByOrderByTotalPointsDesc();
    Supporters findByEmail(String email); 
}
