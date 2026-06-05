package com.example.eldercare.dto;

public class BindListDTO {
    private Long id;
    private Long userId;
    private Long elderlyId;
    private String elderlyName;
    private String username;
    private String phone;
    private String nickname;
    private Integer status;
    private String userType;

    public BindListDTO() {}

    public BindListDTO(Long id, Long userId, Long elderlyId, String username, String phone, String nickname, Integer status, String userType) {
        this.id = id;
        this.userId = userId;
        this.elderlyId = elderlyId;
        this.username = username;
        this.phone = phone;
        this.nickname = nickname;
        this.status = status;
        this.userType = userType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getElderlyId() {
        return elderlyId;
    }

    public void setElderlyId(Long elderlyId) {
        this.elderlyId = elderlyId;
    }

    public String getElderlyName() {
        return elderlyName;
    }

    public void setElderlyName(String elderlyName) {
        this.elderlyName = elderlyName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}