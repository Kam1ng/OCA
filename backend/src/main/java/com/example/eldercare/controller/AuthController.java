package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.LoginDTO;
import com.example.eldercare.dto.LoginResultDTO;
import com.example.eldercare.dto.RegisterDTO;
import com.example.eldercare.entity.User;
import com.example.eldercare.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private final UserService userService;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterDTO dto) {
        User user = userService.register(dto);
        return Result.success("注册成功", user);
    }
    
    @PostMapping("/login")
    public Result<LoginResultDTO> login(@RequestBody LoginDTO dto) {
        LoginResultDTO result = userService.login(dto);
        return Result.success("登录成功", result);
    }
    
    @GetMapping("/user")
    public Result<User> getUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userService.getById(userId);
        return Result.success(user);
    }
    
    @PutMapping("/user")
    public Result<User> updateUser(@RequestBody User user, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        user.setId(userId);
        User updated = userService.update(user);
        return Result.success("更新成功", updated);
    }
    
    @PostMapping("/change-password")
    public Result<Void> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        userService.changePassword(userId, oldPassword, newPassword);
        return Result.success("密码修改成功", null);
    }
}