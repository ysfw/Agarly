package com.agarly.backend.utils;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.Random;

@Getter
@Setter
@Component
public class OtpGenerator {
    private String otp;

    public String generateOTP() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            Random random = new Random();
            int randomNumber = random.nextInt(10);
            sb.append(randomNumber); // 0-9
        }
        this.otp = sb.toString();
        return sb.toString();
    }

}
