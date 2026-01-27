package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuideRepository extends JpaRepository<Guide, Integer> {

    List<Guide> findByCityId(int cityId);

    List<Guide> findByLanguagesContaining(String language);
}