package com.example.eldercare.service.impl;

import com.example.eldercare.dto.HealthDataDTO;
import com.example.eldercare.entity.HealthData;
import com.example.eldercare.mapper.HealthDataMapper;
import com.example.eldercare.service.HealthDataService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HealthDataServiceImpl implements HealthDataService {
    
    private final HealthDataMapper healthDataMapper;
    
    public HealthDataServiceImpl(HealthDataMapper healthDataMapper) {
        this.healthDataMapper = healthDataMapper;
    }
    
    @Override
    public HealthData add(HealthDataDTO dto) {
        HealthData healthData = new HealthData();
        healthData.setElderlyId(dto.getElderlyId());
        healthData.setHeartRate(dto.getHeartRate());
        healthData.setSystolicPressure(dto.getSystolicPressure());
        healthData.setDiastolicPressure(dto.getDiastolicPressure());
        healthData.setTemperature(dto.getTemperature());
        healthData.setSleepStatus(dto.getSleepStatus());
        healthData.setSleepDuration(dto.getSleepDuration());
        healthData.setSteps(dto.getSteps());
        healthData.setRecordTime(LocalDateTime.now());
        healthData.setSource(dto.getSource() != null ? dto.getSource() : 0);
        
        healthDataMapper.insert(healthData);
        return healthData;
    }
    
    @Override
    public HealthData addFromDevice(HealthDataDTO dto) {
        HealthData healthData = new HealthData();
        healthData.setElderlyId(dto.getElderlyId());
        healthData.setHeartRate(dto.getHeartRate());
        healthData.setSystolicPressure(dto.getSystolicPressure());
        healthData.setDiastolicPressure(dto.getDiastolicPressure());
        healthData.setTemperature(dto.getTemperature());
        healthData.setSleepStatus(dto.getSleepStatus());
        healthData.setSleepDuration(dto.getSleepDuration());
        healthData.setSteps(dto.getSteps());
        healthData.setRecordTime(dto.getRecordTime() != null ? dto.getRecordTime() : LocalDateTime.now());
        healthData.setSource(1);
        
        healthDataMapper.insert(healthData);
        return healthData;
    }
    
    @Override
    public List<HealthData> getByElderlyId(Long elderlyId) {
        return healthDataMapper.findByElderlyId(elderlyId);
    }
    
    @Override
    public List<HealthData> getByElderlyIdAndTimeRange(Long elderlyId, LocalDateTime startTime, LocalDateTime endTime) {
        return healthDataMapper.findByElderlyIdAndTimeRange(elderlyId, startTime, endTime);
    }
    
    @Override
    public HealthData getLatest(Long elderlyId) {
        return healthDataMapper.findLatestByElderlyId(elderlyId);
    }

    @Override
    public List<HealthData> getHistory(Long elderlyId) {
        return healthDataMapper.findHistory(elderlyId);
    }
}