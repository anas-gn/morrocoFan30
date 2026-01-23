package com.example.demo.repositories;

import com.example.demo.models.Favorite;
import com.example.demo.models.Supporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findBySupporter(Supporter supporter);
    List<Favorite> findByType(String type);
}
