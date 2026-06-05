package com.example.eldercare.service;

import com.example.eldercare.dto.ElderlyDTO;
import com.example.eldercare.entity.Elderly;

import java.util.List;

public interface ElderlyService {
    Elderly create(Long userId, ElderlyDTO dto);
    Elderly update(Long id, ElderlyDTO dto);
    void delete(Long id);
    Elderly getById(Long id);
    List<Elderly> getByUserId(Long userId);
}