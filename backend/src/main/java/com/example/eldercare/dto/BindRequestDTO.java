package com.example.eldercare.dto;

public class BindRequestDTO {
    private String phone;

    public BindRequestDTO() {}

    public BindRequestDTO(String phone) {
        this.phone = phone;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}