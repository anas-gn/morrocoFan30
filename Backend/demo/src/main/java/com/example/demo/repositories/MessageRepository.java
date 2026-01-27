package com.example.demo.repositories;

import com.example.demo.models.Message;
import com.example.demo.models.Supporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findBySupporter(Supporter supporter);

    List<Message> findByCountry(String country);
}
