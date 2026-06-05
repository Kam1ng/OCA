package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.Fence;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FenceMapper extends BaseMapper<Fence> {
    List<Fence> findByElderlyId(@Param("elderlyId") Long elderlyId);
}