package com.example.demo.repositories;
import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findBySupporterId(Long supporterId);

    List<Report> findByBadOrGood(boolean badOrGood);
}