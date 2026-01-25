package com.example.demo.repositories;
import java.util.List;

import com.example.demo.models.Attraction;
import com.example.demo.models.Hotel;
import com.example.demo.models.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
List<Image> findByHotel(Hotel hotel);
List<Image> findByAttraction(Attraction attraction);

}
