package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.CaptchaDTO;
import com.example.eldercare.service.CaptchaService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/captcha")
public class CaptchaController {

    private final CaptchaService captchaService;
    private final JdbcTemplate jdbcTemplate;

    public CaptchaController(CaptchaService captchaService, JdbcTemplate jdbcTemplate) {
        this.captchaService = captchaService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/generate")
    public Result<CaptchaDTO> generateCaptcha() {
        CaptchaDTO captcha = captchaService.generateCaptcha();
        return Result.success(captcha);
    }

    @GetMapping("/fix-table")
    public Result<String> fixTable() {
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) NULL");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'guardian'");
            return Result.success("Table fixed successfully");
        } catch (Exception e) {
            return Result.error("Failed to fix table: " + e.getMessage());
        }
    }
}