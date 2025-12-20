package com.agarly.backend.repos;

import com.agarly.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

    User findByUsername(String username);

    User findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    void deleteById(Long id);

    //updating and deleting to be implemented later
}
