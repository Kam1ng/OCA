package com.example.eldercare.service;

import com.example.eldercare.dto.CaptchaDTO;

public interface CaptchaService {
    
    CaptchaDTO generateCaptcha();
    
    boolean verifyCaptcha(String captchaKey, String captchaCode);
    
    void removeCaptcha(String captchaKey);
}