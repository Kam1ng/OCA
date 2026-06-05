package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.entity.User;
import com.example.eldercare.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/test")
public class TestController {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public TestController(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/create-user")
    public Result<User> createUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String phone,
            @RequestParam String nickname) {
        
        User existing = userMapper.findByUsername(username);
        if (existing != null) {
            return Result.error(400, "Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setNickname(nickname);
        user.setDeleted(0);

        userMapper.insert(user);
        return Result.success(user);
    }
}