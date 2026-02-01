package com.example.demo.repositories;

import com.example.demo.models.Favorites;
import com.example.demo.models.Supporters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorites, Integer> {

    
    List<Favorites> findByTypeAndOwnerID(String type, int id);
    List<Favorites> findBySupporter(Supporters supporter);
    List<Favorites> findBySupporterAndType(Supporters supporter, String type);
}
