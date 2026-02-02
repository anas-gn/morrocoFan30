package com.example.demo.repositories;

import com.example.demo.models.Reports;
import com.example.demo.models.Supporters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Reports, Integer> {
    List<Reports> findBySupporter(Supporters supporter);
}