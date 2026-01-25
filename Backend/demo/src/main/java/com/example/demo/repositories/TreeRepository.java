package com.example.demo.repositories;

import com.example.demo.models.Tree;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TreeRepository extends JpaRepository<Tree, Integer> {
    List<Tree> findByType(String type);
}