package com.example.demo.repositories;

import com.example.demo.models.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Foods, Integer> {
   
}