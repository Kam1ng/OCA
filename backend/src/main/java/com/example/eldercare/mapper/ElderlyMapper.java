package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.Elderly;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ElderlyMapper extends BaseMapper<Elderly> {
    List<Elderly> findByUserId(@Param("userId") Long userId);
}