package com.example.eldercare.config;

import com.example.eldercare.entity.Elderly;
import com.example.eldercare.entity.User;
import com.example.eldercare.mapper.ElderlyMapper;
import com.example.eldercare.mapper.UserMapper;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class TestDataInitializer implements ApplicationRunner {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ElderlyMapper elderlyMapper;

    public TestDataInitializer(UserMapper userMapper, PasswordEncoder passwordEncoder, ElderlyMapper elderlyMapper) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.elderlyMapper = elderlyMapper;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            if (userMapper.findByUsername("guardian") == null) {
                User guardian = new User();
                guardian.setUsername("guardian");
                guardian.setPassword(passwordEncoder.encode("123456"));
                guardian.setPhone("13800138001");
                guardian.setNickname("Guardian Zhang");
                guardian.setInviteCode("GUARD001");
                guardian.setUserType("guardian");
                guardian.setDeleted(0);
                userMapper.insert(guardian);
                System.out.println("Test guardian user created: username=guardian, password=123456");
            }

            if (userMapper.findByUsername("elderly") == null) {
                User elderly = new User();
                elderly.setUsername("elderly");
                elderly.setPassword(passwordEncoder.encode("123456"));
                elderly.setPhone("13900139001");
                elderly.setNickname("Elderly Li");
                elderly.setInviteCode("ELDER001");
                elderly.setUserType("elderly");
                elderly.setDeleted(0);
                userMapper.insert(elderly);
                
                Elderly elderlyEntity = new Elderly();
                elderlyEntity.setUserId(elderly.getId());
                elderlyEntity.setName("Elderly Li");
                elderlyEntity.setPhone("13900139001");
                elderlyEntity.setDeleted(0);
                elderlyMapper.insert(elderlyEntity);
                
                System.out.println("Test elderly user created: username=elderly, password=123456");
            }
        } catch (Exception e) {
            System.err.println("Failed to create test users: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
