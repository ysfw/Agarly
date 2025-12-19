package com.agarly.backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private String bio;
    private String city;
    private String state;
    private String zipCode;
}


