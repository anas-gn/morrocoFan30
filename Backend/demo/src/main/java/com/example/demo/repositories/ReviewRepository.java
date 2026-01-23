package com.example.demo.repositories;

import com.example.demo.models.Review;
import com.example.demo.models.Supporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findBySupporter(Supporter supporter);
    List<Review> findByRating(int rating);
}
