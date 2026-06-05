package com.example.eldercare.service;

import com.example.eldercare.dto.FenceDTO;
import com.example.eldercare.entity.Fence;

import java.util.List;

public interface FenceService {
    Fence create(FenceDTO dto);
    Fence update(Long id, FenceDTO dto);
    void delete(Long id);
    Fence getById(Long id);
    List<Fence> getByElderlyId(Long elderlyId);
    void checkFence(Long elderlyId, Double latitude, Double longitude);
}