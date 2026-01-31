package com.example.demo.repositories;

import com.example.demo.models.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Integer> {

    // Récupérer toutes les news ordonnées par date (plus récentes en premier)
    List<News> findAllByOrderByDateOfCreationDesc();

    // Récupérer les news par équipe ordonnées par date
    List<News> findByTeamIdOrderByDateOfCreationDesc(Integer teamId);
}