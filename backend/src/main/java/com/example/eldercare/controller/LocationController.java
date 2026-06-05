package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.LocationDataDTO;
import com.example.eldercare.entity.LocationData;
import com.example.eldercare.service.LocationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/location")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping
    public Result<LocationData> updateLocation(@RequestBody LocationDataDTO dto) {
        LocationData locationData = locationService.updateLocation(dto);
        return Result.success("更新成功", locationData);
    }

    @GetMapping("/elderly/{elderlyId}")
    public Result<LocationData> getLatest(@PathVariable Long elderlyId) {
        LocationData locationData = locationService.getLatest(elderlyId);
        return Result.success(locationData);
    }

    @GetMapping("/elderly/{elderlyId}/history")
    public Result<List<LocationData>> getHistory(@PathVariable Long elderlyId) {
        List<LocationData> history = locationService.getHistory(elderlyId);
        return Result.success(history);
    }

    @GetMapping("/elderly/{elderlyId}/today")
    public Result<List<LocationData>> getTodayLocation(@PathVariable Long elderlyId) {
        List<LocationData> today = locationService.getTodayLocation(elderlyId);
        return Result.success(today);
    }
}