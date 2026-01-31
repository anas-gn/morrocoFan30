package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupTeamRepository extends JpaRepository<GroupTeam, Integer> {
    GroupTeam findByGroupIdAndTeamId(int groupId, int teamId);

    List<GroupTeam> findByTeamId(int teamId);

    List<GroupTeam> findByGroupId(int groupId);

}