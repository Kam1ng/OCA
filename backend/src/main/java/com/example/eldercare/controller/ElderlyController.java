package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.ElderlyDTO;
import com.example.eldercare.entity.Elderly;
import com.example.eldercare.service.ElderlyService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/elderly")
public class ElderlyController {
    
    private final ElderlyService elderlyService;
    
    public ElderlyController(ElderlyService elderlyService) {
        this.elderlyService = elderlyService;
    }
    
    @PostMapping
    public Result<Elderly> create(@RequestBody ElderlyDTO dto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Elderly elderly = elderlyService.create(userId, dto);
        return Result.success("创建成功", elderly);
    }
    
    @PutMapping("/{id}")
    public Result<Elderly> update(@PathVariable Long id, @RequestBody ElderlyDTO dto) {
        Elderly elderly = elderlyService.update(id, dto);
        return Result.success("更新成功", elderly);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        elderlyService.delete(id);
        return Result.success("删除成功", null);
    }
    
    @GetMapping("/{id}")
    public Result<Elderly> getById(@PathVariable Long id) {
        Elderly elderly = elderlyService.getById(id);
        return Result.success(elderly);
    }
    
    @GetMapping
    public Result<List<Elderly>> getByUserId(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Elderly> elderlyList = elderlyService.getByUserId(userId);
        return Result.success(elderlyList);
    }
}