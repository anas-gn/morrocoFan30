package com.example.demo.repositories;

import com.example.demo.models.Images;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Images, Integer> {
    List<Images> findByTypeAndOwnerID(String type, int ownerID);
}
