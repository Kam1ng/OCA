package com.example.eldercare.service;

import com.example.eldercare.dto.LocationDataDTO;
import com.example.eldercare.entity.LocationData;

import java.util.List;

public interface LocationService {
    LocationData updateLocation(LocationDataDTO dto);
    LocationData getLatest(Long elderlyId);
    List<LocationData> getHistory(Long elderlyId);
    List<LocationData> getTodayLocation(Long elderlyId);
}