package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.LocationData;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface LocationDataMapper extends BaseMapper<LocationData> {
    LocationData findLatestByElderlyId(@Param("elderlyId") Long elderlyId);
    List<LocationData> findHistoryByElderlyId(@Param("elderlyId") Long elderlyId);
    List<LocationData> findByElderlyIdAndTimeRange(
            @Param("elderlyId") Long elderlyId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}