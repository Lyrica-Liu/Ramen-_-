package com.example.vocab.controller;

import com.example.vocab.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public static class AuthRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ResetRequest {
        private String email;
        private String resetToken;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getResetToken() { return resetToken; }
        public void setResetToken(String resetToken) { this.resetToken = resetToken; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()
                || req.getPassword() == null || req.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid email and password (min 6 characters) required"));
        }
        try {
            return ResponseEntity.ok(authService.register(req.getEmail().trim().toLowerCase(), req.getPassword()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
        }
        try {
            return ResponseEntity.ok(authService.login(req.getEmail().trim().toLowerCase(), req.getPassword()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody AuthRequest req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email required"));
        }
        try {
            return ResponseEntity.ok(authService.requestPasswordReset(req.getEmail().trim().toLowerCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest req) {
        if (req.getResetToken() == null || req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid reset token and password (min 6 characters) required"));
        }
        try {
            return ResponseEntity.ok(authService.resetPassword(req.getResetToken(), req.getNewPassword()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
