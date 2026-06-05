package com.example.eldercare.service;

import com.example.eldercare.dto.BindListDTO;
import com.example.eldercare.dto.BindRequestDTO;
import com.example.eldercare.entity.Binding;

import java.util.List;

public interface BindingService {

    Binding createBinding(Long guardianId, BindRequestDTO request);

    Binding acceptBinding(Long bindingId, Long userId);

    Binding rejectBinding(Long bindingId, Long userId);

    void deleteBinding(Long bindingId, Long userId);

    List<BindListDTO> getGuardianBindings(Long userId);

    List<BindListDTO> getElderlyBindings(Long userId);

    List<BindListDTO> getPendingRequests(Long userId);

    List<Binding> getBindingsByElderlyId(Long elderlyId);

    Binding createBindingForTest(Long guardianId, Long elderlyId);

    Binding getById(Long id);
}