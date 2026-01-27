package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Integer> {

    List<Report> findBySupporterId(int supporterId);

    List<Report> findByBadOrGood(boolean badOrGood);
}