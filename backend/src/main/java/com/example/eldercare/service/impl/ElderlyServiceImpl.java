package com.example.eldercare.service.impl;

import com.example.eldercare.dto.ElderlyDTO;
import com.example.eldercare.entity.Elderly;
import com.example.eldercare.exception.BusinessException;
import com.example.eldercare.mapper.ElderlyMapper;
import com.example.eldercare.service.ElderlyService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElderlyServiceImpl implements ElderlyService {
    
    private final ElderlyMapper elderlyMapper;
    
    public ElderlyServiceImpl(ElderlyMapper elderlyMapper) {
        this.elderlyMapper = elderlyMapper;
    }
    
    @Override
    public Elderly create(Long userId, ElderlyDTO dto) {
        Elderly elderly = new Elderly();
        elderly.setUserId(userId);
        elderly.setName(dto.getName());
        elderly.setAge(dto.getAge());
        elderly.setGender(dto.getGender());
        elderly.setPhone(dto.getPhone());
        elderly.setAddress(dto.getAddress());
        elderly.setEmergencyContact(dto.getEmergencyContact());
        elderly.setEmergencyPhone(dto.getEmergencyPhone());
        elderly.setHealthNotes(dto.getHealthNotes());
        elderly.setDeleted(0);
        
        elderlyMapper.insert(elderly);
        return elderly;
    }
    
    @Override
    public Elderly update(Long id, ElderlyDTO dto) {
        Elderly elderly = elderlyMapper.selectById(id);
        if (elderly == null) {
            throw new BusinessException(404, "老人信息不存在");
        }
        
        elderly.setName(dto.getName());
        elderly.setAge(dto.getAge());
        elderly.setGender(dto.getGender());
        elderly.setPhone(dto.getPhone());
        elderly.setAddress(dto.getAddress());
        elderly.setEmergencyContact(dto.getEmergencyContact());
        elderly.setEmergencyPhone(dto.getEmergencyPhone());
        elderly.setHealthNotes(dto.getHealthNotes());
        
        elderlyMapper.updateById(elderly);
        return elderly;
    }
    
    @Override
    public void delete(Long id) {
        Elderly elderly = elderlyMapper.selectById(id);
        if (elderly == null) {
            throw new BusinessException(404, "老人信息不存在");
        }
        elderly.setDeleted(1);
        elderlyMapper.updateById(elderly);
    }
    
    @Override
    public Elderly getById(Long id) {
        return elderlyMapper.selectById(id);
    }
    
    @Override
    public List<Elderly> getByUserId(Long userId) {
        return elderlyMapper.findByUserId(userId);
    }
}