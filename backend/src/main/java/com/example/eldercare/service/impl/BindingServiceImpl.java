package com.example.eldercare.service.impl;

import com.example.eldercare.dto.BindListDTO;
import com.example.eldercare.dto.BindRequestDTO;
import com.example.eldercare.entity.Binding;
import com.example.eldercare.entity.Elderly;
import com.example.eldercare.entity.User;
import com.example.eldercare.exception.BusinessException;
import com.example.eldercare.mapper.BindingMapper;
import com.example.eldercare.mapper.ElderlyMapper;
import com.example.eldercare.mapper.UserMapper;
import com.example.eldercare.service.BindingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BindingServiceImpl implements BindingService {

    private final BindingMapper bindingMapper;
    private final UserMapper userMapper;
    private final ElderlyMapper elderlyMapper;

    public BindingServiceImpl(BindingMapper bindingMapper, UserMapper userMapper, ElderlyMapper elderlyMapper) {
        this.bindingMapper = bindingMapper;
        this.userMapper = userMapper;
        this.elderlyMapper = elderlyMapper;
    }

    @Override
    @Transactional
    public Binding createBinding(Long guardianId, BindRequestDTO request) {
        if (request.getPhone() == null || request.getPhone().isEmpty()) {
            throw new BusinessException("请输入老人手机号");
        }

        User elderlyUser = userMapper.selectByPhone(request.getPhone());
        if (elderlyUser == null) {
            throw new BusinessException("未找到对应的老人用户");
        }

        if (elderlyUser.getId().equals(guardianId)) {
            throw new BusinessException("不能绑定自己");
        }

        List<Elderly> elderlyList = elderlyMapper.findByUserId(elderlyUser.getId());
        if (elderlyList == null || elderlyList.isEmpty()) {
            throw new BusinessException("该用户不是老人用户");
        }
        Elderly elderly = elderlyList.get(0);

        Binding existing = bindingMapper.selectByGuardianAndElderly(guardianId, elderly.getId());
        if (existing != null) {
            if (existing.getStatus() == Binding.STATUS_PENDING) {
                throw new BusinessException("绑定请求已发送，等待对方确认");
            } else if (existing.getStatus() == Binding.STATUS_ACCEPTED) {
                throw new BusinessException("已绑定该老人");
            }
        }

        Binding binding = new Binding();
        binding.setGuardianId(guardianId);
        binding.setElderlyId(elderly.getId());
        binding.setStatus(Binding.STATUS_PENDING);
        binding.setDeleted(0);

        bindingMapper.insert(binding);
        return binding;
    }

    @Override
    @Transactional
    public Binding acceptBinding(Long bindingId, Long userId) {
        Binding binding = bindingMapper.selectById(bindingId);
        if (binding == null || binding.getDeleted() == 1) {
            throw new BusinessException("绑定记录不存在");
        }

        List<Elderly> elderlyList = elderlyMapper.findByUserId(userId);
        if (elderlyList == null || elderlyList.isEmpty()) {
            throw new BusinessException("无权操作此绑定请求");
        }
        Long elderlyId = elderlyList.get(0).getId();

        if (!binding.getElderlyId().equals(elderlyId)) {
            throw new BusinessException("无权操作此绑定请求");
        }

        if (binding.getStatus() != Binding.STATUS_PENDING) {
            throw new BusinessException("绑定状态不允许此操作");
        }

        binding.setStatus(Binding.STATUS_ACCEPTED);
        bindingMapper.updateById(binding);
        return binding;
    }

    @Override
    @Transactional
    public Binding rejectBinding(Long bindingId, Long userId) {
        Binding binding = bindingMapper.selectById(bindingId);
        if (binding == null || binding.getDeleted() == 1) {
            throw new BusinessException("绑定记录不存在");
        }

        List<Elderly> elderlyList = elderlyMapper.findByUserId(userId);
        if (elderlyList == null || elderlyList.isEmpty()) {
            throw new BusinessException("无权操作此绑定请求");
        }
        Long elderlyId = elderlyList.get(0).getId();

        if (!binding.getElderlyId().equals(elderlyId)) {
            throw new BusinessException("无权操作此绑定请求");
        }

        if (binding.getStatus() != Binding.STATUS_PENDING) {
            throw new BusinessException("绑定状态不允许此操作");
        }

        binding.setStatus(Binding.STATUS_REJECTED);
        bindingMapper.updateById(binding);
        return binding;
    }

    @Override
    @Transactional
    public void deleteBinding(Long bindingId, Long userId) {
        Binding binding = bindingMapper.selectById(bindingId);
        if (binding == null || binding.getDeleted() == 1) {
            throw new BusinessException("绑定记录不存在");
        }

        List<Elderly> elderlyList = elderlyMapper.findByUserId(userId);
        Long elderlyId = elderlyList != null && !elderlyList.isEmpty() ? elderlyList.get(0).getId() : null;

        if (!binding.getGuardianId().equals(userId) && (elderlyId == null || !binding.getElderlyId().equals(elderlyId))) {
            throw new BusinessException("无权操作此绑定");
        }

        binding.setDeleted(1);
        bindingMapper.updateById(binding);
    }

    @Override
    public List<BindListDTO> getGuardianBindings(Long userId) {
        List<Binding> bindings = bindingMapper.selectByGuardianId(userId);
        return bindings.stream()
                .map(b -> {
                    Elderly elderly = elderlyMapper.selectById(b.getElderlyId());
                    if (elderly == null) return null;
                    BindListDTO dto = new BindListDTO();
                    dto.setId(b.getId());
                    dto.setUserId(userId);
                    dto.setElderlyId(elderly.getId());
                    dto.setElderlyName(elderly.getName());
                    dto.setPhone(elderly.getPhone());
                    dto.setStatus(b.getStatus());
                    dto.setUserType("elderly");
                    return dto;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<BindListDTO> getElderlyBindings(Long userId) {
        List<Elderly> elderlyList = elderlyMapper.findByUserId(userId);
        if (elderlyList == null || elderlyList.isEmpty()) {
            return List.of();
        }
        Long elderlyId = elderlyList.get(0).getId();

        List<Binding> bindings = bindingMapper.selectByElderlyId(elderlyId);
        return bindings.stream()
                .map(b -> {
                    User user = userMapper.selectById(b.getGuardianId());
                    BindListDTO dto = new BindListDTO();
                    dto.setId(b.getId());
                    dto.setUserId(user.getId());
                    dto.setElderlyId(elderlyId);
                    dto.setUsername(user.getUsername());
                    dto.setPhone(user.getPhone());
                    dto.setNickname(user.getNickname());
                    dto.setStatus(b.getStatus());
                    dto.setUserType("guardian");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BindListDTO> getPendingRequests(Long userId) {
        List<Elderly> elderlyList = elderlyMapper.findByUserId(userId);
        if (elderlyList == null || elderlyList.isEmpty()) {
            return List.of();
        }
        Long elderlyId = elderlyList.get(0).getId();

        List<Binding> bindings = bindingMapper.selectByElderlyId(elderlyId);
        return bindings.stream()
                .filter(b -> b.getStatus() == Binding.STATUS_PENDING)
                .map(b -> {
                    User user = userMapper.selectById(b.getGuardianId());
                    BindListDTO dto = new BindListDTO();
                    dto.setId(b.getId());
                    dto.setUserId(user.getId());
                    dto.setElderlyId(elderlyId);
                    dto.setUsername(user.getUsername());
                    dto.setPhone(user.getPhone());
                    dto.setNickname(user.getNickname());
                    dto.setStatus(b.getStatus());
                    dto.setUserType("guardian");
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Binding> getBindingsByElderlyId(Long elderlyId) {
        return bindingMapper.selectByElderlyId(elderlyId);
    }

    @Override
    public Binding createBindingForTest(Long guardianId, Long elderlyId) {
        Binding binding = new Binding();
        binding.setGuardianId(guardianId);
        binding.setElderlyId(elderlyId);
        binding.setStatus(1);
        binding.setDeleted(0);
        bindingMapper.insert(binding);
        return binding;
    }

    @Override
    public Binding getById(Long id) {
        return bindingMapper.selectById(id);
    }
}