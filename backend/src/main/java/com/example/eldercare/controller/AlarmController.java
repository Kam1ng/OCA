package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.response.AlarmDTO;
import com.example.eldercare.entity.Alarm;
import com.example.eldercare.entity.User;
import com.example.eldercare.service.AlarmService;
import com.example.eldercare.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/alarm")
public class AlarmController {
    
    private final AlarmService alarmService;
    private final UserService userService;
    
    public AlarmController(AlarmService alarmService, UserService userService) {
        this.alarmService = alarmService;
        this.userService = userService;
    }
    
    @PostMapping("/emergency")
    public Result<Alarm> createEmergencyAlarm(@RequestBody Map<String, Object> request) {
        Long elderlyId = ((Number) request.get("elderlyId")).longValue();
        Double latitude = ((Number) request.get("latitude")).doubleValue();
        Double longitude = ((Number) request.get("longitude")).doubleValue();
        
        Alarm alarm = alarmService.createEmergencyAlarm(elderlyId, latitude, longitude);
        return Result.success("告警已发送", alarm);
    }
    
    @GetMapping("/elderly/{elderlyId}")
    public Result<List<Alarm>> getByElderlyId(@PathVariable Long elderlyId) {
        List<Alarm> alarms = alarmService.getByElderlyId(elderlyId);
        return Result.success(alarms);
    }
    
    @GetMapping("/elderly/{elderlyId}/unhandled")
    public Result<List<Alarm>> getUnHandledByElderlyId(@PathVariable Long elderlyId) {
        List<Alarm> alarms = alarmService.getUnHandledByElderlyId(elderlyId);
        return Result.success(alarms);
    }
    
    @PutMapping("/{id}/handle")
    public Result<Alarm> handle(@PathVariable Long id) {
        Alarm alarm = alarmService.handle(id);
        return Result.success("已处理", alarm);
    }
    
    @GetMapping("/guardian/{guardianId}")
    public Result<List<AlarmDTO>> getByGuardianId(@PathVariable Long guardianId) {
        List<Alarm> alarms = alarmService.getByGuardianId(guardianId);
        
        List<AlarmDTO> dtoList = alarms.stream().map(alarm -> {
            User elderly = userService.getById(alarm.getElderlyId());
            String elderlyName = elderly != null ? (elderly.getNickname() != null && !elderly.getNickname().isEmpty() ? elderly.getNickname() : elderly.getUsername()) : "老人";
            
            return AlarmDTO.builder()
                    .id(alarm.getId())
                    .alarmType(mapAlarmType(alarm.getType()))
                    .content(alarm.getMessage())
                    .elderlyName(elderlyName)
                    .createTime(alarm.getCreatedAt())
                    .status(alarm.getStatus() == 1 ? "handled" : "pending")
                    .build();
        }).collect(Collectors.toList());
        
        return Result.success(dtoList);
    }
    
    private String mapAlarmType(Integer type) {
        Map<Integer, String> typeMap = Map.of(
            1, "sos",
            2, "fence",
            3, "heartRate",
            4, "fall",
            5, "battery"
        );
        return typeMap.getOrDefault(type, "unknown");
    }
}