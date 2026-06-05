package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/heartbeat")
public class HeartbeatController {
    
    @PostMapping
    public Result<Map<String, Object>> heartbeat() {
        return Result.success(Map.of(
            "status", "ok",
            "timestamp", System.currentTimeMillis()
        ));
    }
}