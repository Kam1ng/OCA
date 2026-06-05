package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.HealthDataDTO;
import com.example.eldercare.entity.HealthData;
import com.example.eldercare.service.HealthDataService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/health")
public class HealthDataController {
    
    private final HealthDataService healthDataService;
    
    public HealthDataController(HealthDataService healthDataService) {
        this.healthDataService = healthDataService;
    }
    
    @PostMapping
    public Result<HealthData> add(@RequestBody HealthDataDTO dto) {
        HealthData healthData = healthDataService.add(dto);
        return Result.success("添加成功", healthData);
    }
    
    @PostMapping("/device")
    public Result<HealthData> addFromDevice(@RequestBody HealthDataDTO dto) {
        HealthData healthData = healthDataService.addFromDevice(dto);
        return Result.success("设备数据接收成功", healthData);
    }
    
    @GetMapping("/elderly/{elderlyId}")
    public Result<List<HealthData>> getByElderlyId(@PathVariable Long elderlyId) {
        List<HealthData> list = healthDataService.getByElderlyId(elderlyId);
        return Result.success(list);
    }
    
    @GetMapping("/elderly/{elderlyId}/range")
    public Result<List<HealthData>> getByTimeRange(
            @PathVariable Long elderlyId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        List<HealthData> list = healthDataService.getByElderlyIdAndTimeRange(elderlyId, start, end);
        return Result.success(list);
    }
    
    @GetMapping("/elderly/{elderlyId}/latest")
    public Result<HealthData> getLatest(@PathVariable Long elderlyId) {
        HealthData healthData = healthDataService.getLatest(elderlyId);
        return Result.success(healthData);
    }

    @GetMapping("/elderly/{elderlyId}/history")
    public Result<List<HealthData>> getHistory(@PathVariable Long elderlyId) {
        List<HealthData> list = healthDataService.getHistory(elderlyId);
        return Result.success(list);
    }
}