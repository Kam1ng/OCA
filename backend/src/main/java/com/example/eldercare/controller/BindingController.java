package com.example.eldercare.controller;

import com.example.eldercare.common.Result;
import com.example.eldercare.config.RequestUserId;
import com.example.eldercare.dto.BindListDTO;
import com.example.eldercare.dto.BindRequestDTO;
import com.example.eldercare.entity.Binding;
import com.example.eldercare.entity.Elderly;
import com.example.eldercare.service.BindingService;
import com.example.eldercare.service.ElderlyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/binding")
public class BindingController {

    private final BindingService bindingService;
    private final ElderlyService elderlyService;

    public BindingController(BindingService bindingService, ElderlyService elderlyService) {
        this.bindingService = bindingService;
        this.elderlyService = elderlyService;
    }

    @PostMapping("/request")
    public Result<Binding> createBinding(@RequestBody BindRequestDTO request, @RequestUserId Long userId) {
        Binding binding = bindingService.createBinding(userId, request);
        return Result.success(binding);
    }

    @PostMapping("/{id}/accept")
    public Result<Binding> acceptBinding(@PathVariable Long id, @RequestUserId Long userId) {
        Binding binding = bindingService.acceptBinding(id, userId);
        return Result.success(binding);
    }

    @PostMapping("/{id}/reject")
    public Result<Binding> rejectBinding(@PathVariable Long id, @RequestUserId Long userId) {
        Binding binding = bindingService.rejectBinding(id, userId);
        return Result.success(binding);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteBinding(@PathVariable Long id, @RequestUserId Long userId) {
        bindingService.deleteBinding(id, userId);
        return Result.success();
    }

    @GetMapping("/guardian/list")
    public Result<List<BindListDTO>> getGuardianBindings(@RequestUserId Long userId) {
        List<BindListDTO> bindings = bindingService.getGuardianBindings(userId);
        return Result.success(bindings);
    }

    @GetMapping("/elderly/list")
    public Result<List<BindListDTO>> getElderlyBindings(@RequestUserId Long userId) {
        List<BindListDTO> bindings = bindingService.getElderlyBindings(userId);
        return Result.success(bindings);
    }

    @GetMapping("/my-elderly")
    public Result<Elderly> getMyElderly(@RequestUserId Long userId) {
        List<Elderly> elderlyList = elderlyService.getByUserId(userId);
        if (elderlyList == null || elderlyList.isEmpty()) {
            return Result.error("该用户不是老人用户");
        }
        return Result.success(elderlyList.get(0));
    }

    @GetMapping("/pending")
    public Result<List<BindListDTO>> getPendingRequests(@RequestUserId Long userId) {
        List<BindListDTO> bindings = bindingService.getPendingRequests(userId);
        return Result.success(bindings);
    }
}