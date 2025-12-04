package com.agarly.backend.services;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String from;

    public void sendVerificationEmail(String email, String otp) {
        String subject = "Email Verification";
//      String path = "/signup/verify";
        String message = "Your verification code is:";
        sendEmail(email, otp, subject, message);
    }

    private void sendEmail(String email, String otp, String subject, String message) {
        try {
//            String frontendUrl = "http://localhost:4200";
//            String actionUrl = frontendUrl + path + "?token=" + token;
            System.out.println("Sending email to " + email);
            String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
                    <h2 style="color: #333;">%s</h2>
                    <p style="font-size: 16px; color: #555;">%s</p>
                    <p style="font-size: 20px; font-weight: bold; color: #007bff;">%s</p>
                    <p style="font-size: 12px; color: #aaa;">This you Agarly account verification code. Do not share it with anyone.</p>
                </div>
            """.formatted(subject, message, otp);
//            System.out.println("mail content created");

            MimeMessage mimeMessage = mailSender.createMimeMessage();
//            System.out.println("mime msg created");
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
//            System.out.println("mime msg helper created");

            helper.setTo(email);
//            System.out.println("email is set");
            helper.setSubject(subject);
//            System.out.println("subj is set");
            helper.setFrom(from);
//            System.out.println("sender is set");
            helper.setText(content, true);
//            System.out.println("content is set");
            mailSender.send(mimeMessage);
//            System.out.println("email sent successfully");

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
