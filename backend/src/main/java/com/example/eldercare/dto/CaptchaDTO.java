package com.example.eldercare.dto;

public class CaptchaDTO {
    private String captchaKey;
    private String captchaBase64;

    public CaptchaDTO() {}

    public CaptchaDTO(String captchaKey, String captchaBase64) {
        this.captchaKey = captchaKey;
        this.captchaBase64 = captchaBase64;
    }

    public String getCaptchaKey() {
        return captchaKey;
    }

    public void setCaptchaKey(String captchaKey) {
        this.captchaKey = captchaKey;
    }

    public String getCaptchaBase64() {
        return captchaBase64;
    }

    public void setCaptchaBase64(String captchaBase64) {
        this.captchaBase64 = captchaBase64;
    }
}