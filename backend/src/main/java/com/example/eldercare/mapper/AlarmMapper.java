package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.Alarm;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AlarmMapper extends BaseMapper<Alarm> {
    List<Alarm> findByElderlyId(@Param("elderlyId") Long elderlyId);
    List<Alarm> findByElderlyIdAndStatus(@Param("elderlyId") Long elderlyId, @Param("status") Integer status);
    List<Alarm> findByGuardianId(@Param("guardianId") Long guardianId);
}