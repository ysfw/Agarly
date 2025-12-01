package com.agarly.backend.models;

import com.agarly.backend.models.Enums.AuthProvider;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
public class User {
    @Id

    //db handles id generation
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    @Column(nullable = true)
    private String password;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String lastName;
    private String address;
    private Boolean activated;
    private Boolean blocked;
    private String otp;
    private Boolean verified;
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    public User() {

    }



}
