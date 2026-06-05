package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.dto.FenceDTO;
import com.example.eldercare.entity.Fence;
import com.example.eldercare.service.FenceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fence")
public class FenceController {
    
    private final FenceService fenceService;
    
    public FenceController(FenceService fenceService) {
        this.fenceService = fenceService;
    }
    
    @PostMapping
    public Result<Fence> create(@RequestBody FenceDTO dto) {
        Fence fence = fenceService.create(dto);
        return Result.success("创建成功", fence);
    }
    
    @PutMapping("/{id}")
    public Result<Fence> update(@PathVariable Long id, @RequestBody FenceDTO dto) {
        Fence fence = fenceService.update(id, dto);
        return Result.success("更新成功", fence);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        fenceService.delete(id);
        return Result.success("删除成功", null);
    }
    
    @GetMapping("/{id}")
    public Result<Fence> getById(@PathVariable Long id) {
        Fence fence = fenceService.getById(id);
        return Result.success(fence);
    }
    
    @GetMapping("/elderly/{elderlyId}")
    public Result<List<Fence>> getByElderlyId(@PathVariable Long elderlyId) {
        List<Fence> fences = fenceService.getByElderlyId(elderlyId);
        return Result.success(fences);
    }
}