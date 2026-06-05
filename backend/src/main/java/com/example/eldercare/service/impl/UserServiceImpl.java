package com.example.eldercare.service.impl;

import com.example.eldercare.dto.LoginDTO;
import com.example.eldercare.dto.LoginResultDTO;
import com.example.eldercare.dto.RegisterDTO;
import com.example.eldercare.entity.Elderly;
import com.example.eldercare.entity.User;
import com.example.eldercare.exception.BusinessException;
import com.example.eldercare.mapper.ElderlyMapper;
import com.example.eldercare.mapper.UserMapper;
import com.example.eldercare.service.CaptchaService;
import com.example.eldercare.service.UserService;
import com.example.eldercare.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CaptchaService captchaService;
    private final ElderlyMapper elderlyMapper;

    public UserServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, CaptchaService captchaService, ElderlyMapper elderlyMapper) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.captchaService = captchaService;
        this.elderlyMapper = elderlyMapper;
    }

    @Override
    public User register(RegisterDTO dto) {
        if (!captchaService.verifyCaptcha(dto.getCaptchaKey(), dto.getCaptchaCode())) {
            throw new BusinessException(400, "验证码错误或已过期");
        }

        if (dto.getUserType() == null || (!dto.getUserType().equals("elderly") && !dto.getUserType().equals("guardian"))) {
            throw new BusinessException(400, "请选择有效身份");
        }

        User existing = userMapper.findByUsername(dto.getUsername());
        if (existing != null) {
            throw new BusinessException(400, "用户名已存在");
        }

        User existingByPhone = userMapper.selectByPhone(dto.getPhone());
        if (existingByPhone != null) {
            throw new BusinessException(400, "手机号已被注册");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setNickname(dto.getNickname());
        user.setUserType(dto.getUserType());

        userMapper.insertUser(user);

        if ("elderly".equals(dto.getUserType())) {
            Elderly elderly = new Elderly();
            elderly.setUserId(user.getId());
            elderly.setName(dto.getNickname());
            elderly.setPhone(dto.getPhone());
            elderly.setDeleted(0);
            elderlyMapper.insert(elderly);
        }

        return user;
    }

    @Override
    public LoginResultDTO login(LoginDTO dto) {
        User user = userMapper.selectByPhone(dto.getPhone());
        if (user == null || !passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(401, "手机号或密码错误");
        }

        if (dto.getClientType() != null && !dto.getClientType().isEmpty()) {
            if ("guardian".equals(dto.getClientType()) && "elderly".equals(user.getUserType())) {
                throw new BusinessException(403, "监护端无法登录老人账号");
            }
            if ("elderly".equals(dto.getClientType()) && "guardian".equals(user.getUserType())) {
                throw new BusinessException(403, "老人端无法登录监护人账号");
            }
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        LoginResultDTO result = new LoginResultDTO();
        result.setUserId(user.getId());
        result.setUsername(user.getUsername());
        result.setNickname(user.getNickname());
        result.setToken(token);

        List<Elderly> elderlyList = elderlyMapper.findByUserId(user.getId());
        if (elderlyList != null && !elderlyList.isEmpty()) {
            result.setUserType("elderly");
            result.setElderlyId(elderlyList.get(0).getId());
        } else {
            result.setUserType("guardian");
            result.setElderlyId(null);
        }

        return result;
    }

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User update(User user) {
        userMapper.updateById(user);
        return userMapper.selectById(user.getId());
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException(400, "原密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userMapper.updateById(user);
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
