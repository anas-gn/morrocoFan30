package com.example.demo.repositories;

import com.example.demo.models.Cultures;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultureRepository extends JpaRepository<Cultures, Integer> {

    List<Cultures> findByTeamId(Integer teamId);

}
