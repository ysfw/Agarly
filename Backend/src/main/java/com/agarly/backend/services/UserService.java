package com.agarly.backend.services;

import com.agarly.backend.models.Enums.AuthProvider;
import com.agarly.backend.models.LoginCredentials;
import com.agarly.backend.models.User;
import com.agarly.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private BCryptPasswordEncoder PasswordEncoder = new BCryptPasswordEncoder(12);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private JWTService jwtService;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        user.setPassword(PasswordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public String verify(LoginCredentials userCredentials) {
        User user = findByEmail(userCredentials.getEmail());
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), userCredentials.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUsername());
        } else {
            return "fail";
        }
    }
    // public void deleteById(Long id) {
    // userRepository.deleteById(id);
    // }

    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    public User loginWithGoogle(String idTokenString) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
                System.out.println(payload.toString());
                String email = payload.getEmail();
                String firstName = (String) payload.get("given_name");
                String lastName = (String) payload.get("family_name");

                User user = findByEmail(email);
                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(email.substring(0, email.indexOf("@")));
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setActivated(true);
                    user.setBlocked(false);
                    user.setProvider(AuthProvider.GOOGLE);
                    user.setVerified(true);
                    user.setProfileImageUrl((String) payload.get("picture"));
                }

                return user;
            } else {
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
