package com.example.demo.repositories;

import com.example.demo.models.Supporters;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface SupporterRepository extends JpaRepository<Supporters, Integer> {
    Supporters findById(int id);
    
    List<Supporters> findAllByOrderByTotalPointsDesc();

}
