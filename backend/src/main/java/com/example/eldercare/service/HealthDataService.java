package com.example.eldercare.service;

import com.example.eldercare.dto.HealthDataDTO;
import com.example.eldercare.entity.HealthData;

import java.time.LocalDateTime;
import java.util.List;

public interface HealthDataService {
    HealthData add(HealthDataDTO dto);
    HealthData addFromDevice(HealthDataDTO dto);
    List<HealthData> getByElderlyId(Long elderlyId);
    List<HealthData> getByElderlyIdAndTimeRange(Long elderlyId, LocalDateTime startTime, LocalDateTime endTime);
    HealthData getLatest(Long elderlyId);
    List<HealthData> getHistory(Long elderlyId);
}