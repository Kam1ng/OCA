package com.example.eldercare.service.impl;

import com.example.eldercare.entity.Alarm;
import com.example.eldercare.exception.BusinessException;
import com.example.eldercare.mapper.AlarmMapper;
import com.example.eldercare.service.AlarmService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlarmServiceImpl implements AlarmService {
    
    private final AlarmMapper alarmMapper;
    
    public AlarmServiceImpl(AlarmMapper alarmMapper) {
        this.alarmMapper = alarmMapper;
    }
    
    @Override
    public Alarm createEmergencyAlarm(Long elderlyId, Double latitude, Double longitude) {
        Alarm alarm = new Alarm();
        alarm.setElderlyId(elderlyId);
        alarm.setType(1);
        alarm.setStatus(0);
        alarm.setMessage("老人触发紧急求助");
        alarm.setLatitude(latitude);
        alarm.setLongitude(longitude);
        
        alarmMapper.insert(alarm);
        return alarm;
    }
    
    @Override
    public List<Alarm> getByElderlyId(Long elderlyId) {
        return alarmMapper.findByElderlyId(elderlyId);
    }
    
    @Override
    public List<Alarm> getUnHandledByElderlyId(Long elderlyId) {
        return alarmMapper.findByElderlyIdAndStatus(elderlyId, 0);
    }
    
    @Override
    public Alarm handle(Long id) {
        Alarm alarm = alarmMapper.selectById(id);
        if (alarm == null) {
            throw new BusinessException(404, "告警不存在");
        }
        
        alarm.setStatus(1);
        alarm.setHandledAt(LocalDateTime.now());
        alarmMapper.updateById(alarm);
        
        return alarm;
    }
    
    @Override
    public List<Alarm> getByGuardianId(Long guardianId) {
        return alarmMapper.findByGuardianId(guardianId);
    }
}