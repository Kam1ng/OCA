package com.example.eldercare.service.impl;

import com.example.eldercare.dto.FenceDTO;
import com.example.eldercare.entity.Alarm;
import com.example.eldercare.entity.Fence;
import com.example.eldercare.exception.BusinessException;
import com.example.eldercare.mapper.AlarmMapper;
import com.example.eldercare.mapper.FenceMapper;
import com.example.eldercare.service.FenceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FenceServiceImpl implements FenceService {
    
    private final FenceMapper fenceMapper;
    private final AlarmMapper alarmMapper;
    
    public FenceServiceImpl(FenceMapper fenceMapper, AlarmMapper alarmMapper) {
        this.fenceMapper = fenceMapper;
        this.alarmMapper = alarmMapper;
    }
    
    @Override
    public Fence create(FenceDTO dto) {
        Fence fence = new Fence();
        fence.setElderlyId(dto.getElderlyId());
        fence.setName(dto.getName());
        fence.setCenterLatitude(dto.getCenterLatitude());
        fence.setCenterLongitude(dto.getCenterLongitude());
        fence.setRadius(dto.getRadius());
        fence.setEnabled(dto.getEnabled() != null ? dto.getEnabled() : 1);
        fence.setDeleted(0);
        
        fenceMapper.insert(fence);
        return fence;
    }
    
    @Override
    public Fence update(Long id, FenceDTO dto) {
        Fence fence = fenceMapper.selectById(id);
        if (fence == null) {
            throw new BusinessException(404, "电子围栏不存在");
        }
        
        fence.setName(dto.getName());
        fence.setCenterLatitude(dto.getCenterLatitude());
        fence.setCenterLongitude(dto.getCenterLongitude());
        fence.setRadius(dto.getRadius());
        if (dto.getEnabled() != null) {
            fence.setEnabled(dto.getEnabled());
        }
        
        fenceMapper.updateById(fence);
        return fence;
    }
    
    @Override
    public void delete(Long id) {
        Fence fence = fenceMapper.selectById(id);
        if (fence == null) {
            throw new BusinessException(404, "电子围栏不存在");
        }
        fence.setDeleted(1);
        fenceMapper.updateById(fence);
    }
    
    @Override
    public Fence getById(Long id) {
        return fenceMapper.selectById(id);
    }
    
    @Override
    public List<Fence> getByElderlyId(Long elderlyId) {
        return fenceMapper.findByElderlyId(elderlyId);
    }
    
    @Override
    public void checkFence(Long elderlyId, Double latitude, Double longitude) {
        List<Fence> fences = fenceMapper.findByElderlyId(elderlyId);
        
        for (Fence fence : fences) {
            if (fence.getEnabled() == 0) continue;
            
            double distance = calculateDistance(
                    fence.getCenterLatitude(), fence.getCenterLongitude(),
                    latitude, longitude
            );
            
            if (distance > fence.getRadius()) {
                Alarm alarm = new Alarm();
                alarm.setElderlyId(elderlyId);
                alarm.setType(2);
                alarm.setStatus(0);
                alarm.setMessage("老人离开安全区域：" + fence.getName());
                alarm.setLatitude(latitude);
                alarm.setLongitude(longitude);
                
                alarmMapper.insert(alarm);
            }
        }
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}