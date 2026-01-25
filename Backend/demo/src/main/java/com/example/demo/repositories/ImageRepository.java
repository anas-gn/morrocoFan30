package com.example.demo.repositories;

import com.example.demo.models.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByOwnerID(Long ownerID);

    List<Image> findByType(String type);

    List<Image> findByOwnerIDAndType(Long ownerID, String type);
}
