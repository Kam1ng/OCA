package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.HealthData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface HealthDataMapper extends BaseMapper<HealthData> {
    List<HealthData> findByElderlyId(@Param("elderlyId") Long elderlyId);
    List<HealthData> findByElderlyIdAndTimeRange(
            @Param("elderlyId") Long elderlyId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    HealthData findLatestByElderlyId(@Param("elderlyId") Long elderlyId);
    List<HealthData> findHistory(@Param("elderlyId") Long elderlyId);
}