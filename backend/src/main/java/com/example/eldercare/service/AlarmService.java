package com.example.eldercare.service;

import com.example.eldercare.entity.Alarm;

import java.util.List;

public interface AlarmService {
    Alarm createEmergencyAlarm(Long elderlyId, Double latitude, Double longitude);
    List<Alarm> getByElderlyId(Long elderlyId);
    List<Alarm> getUnHandledByElderlyId(Long elderlyId);
    Alarm handle(Long id);
    List<Alarm> getByGuardianId(Long guardianId);
}