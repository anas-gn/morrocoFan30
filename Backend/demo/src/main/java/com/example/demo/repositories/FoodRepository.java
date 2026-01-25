package com.example.demo.repositories;

import com.example.demo.models.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {
    List<Food> findByName(String name);

    List<Food> findByCategory(String category);

    List<Food> findByCityId(Integer cityId);
}