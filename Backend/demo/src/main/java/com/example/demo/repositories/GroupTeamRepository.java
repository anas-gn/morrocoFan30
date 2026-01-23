package com.example.demo.repositories;
import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupTeamRepository extends JpaRepository<GroupTeam, Long> {

    List<GroupTeam> findByGroupId(Long groupId);

    List<GroupTeam> findByTeamId(Long teamId);
}