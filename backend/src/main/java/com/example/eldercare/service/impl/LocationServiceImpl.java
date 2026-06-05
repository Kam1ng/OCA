package com.example.eldercare.service.impl;

import com.example.eldercare.dto.LocationDataDTO;
import com.example.eldercare.entity.LocationData;
import com.example.eldercare.mapper.LocationDataMapper;
import com.example.eldercare.service.LocationService;
import com.example.eldercare.service.FenceService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class LocationServiceImpl implements LocationService {

    private final LocationDataMapper locationDataMapper;
    private final FenceService fenceService;

    public LocationServiceImpl(LocationDataMapper locationDataMapper, FenceService fenceService) {
        this.locationDataMapper = locationDataMapper;
        this.fenceService = fenceService;
    }

    @Override
    public LocationData updateLocation(LocationDataDTO dto) {
        LocationData locationData = new LocationData();
        locationData.setElderlyId(dto.getElderlyId());
        locationData.setLatitude(dto.getLatitude());
        locationData.setLongitude(dto.getLongitude());
        locationData.setAccuracy(dto.getAccuracy());
        locationData.setAddress(dto.getAddress());
        locationData.setUpdateTime(LocalDateTime.now());

        locationDataMapper.insert(locationData);

        fenceService.checkFence(dto.getElderlyId(), dto.getLatitude(), dto.getLongitude());

        return locationData;
    }

    @Override
    public LocationData getLatest(Long elderlyId) {
        return locationDataMapper.findLatestByElderlyId(elderlyId);
    }

    @Override
    public List<LocationData> getHistory(Long elderlyId) {
        return locationDataMapper.findHistoryByElderlyId(elderlyId);
    }

    @Override
    public List<LocationData> getTodayLocation(Long elderlyId) {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().with(LocalTime.MAX);
        return locationDataMapper.findByElderlyIdAndTimeRange(elderlyId, startOfDay, endOfDay);
    }
}