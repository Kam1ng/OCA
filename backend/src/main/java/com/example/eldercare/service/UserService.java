package com.example.eldercare.service;

import com.example.eldercare.dto.LoginDTO;
import com.example.eldercare.dto.LoginResultDTO;
import com.example.eldercare.dto.RegisterDTO;
import com.example.eldercare.entity.User;

public interface UserService {
    User register(RegisterDTO dto);
    LoginResultDTO login(LoginDTO dto);
    User getById(Long id);
    User update(User user);
    void changePassword(Long userId, String oldPassword, String newPassword);
}