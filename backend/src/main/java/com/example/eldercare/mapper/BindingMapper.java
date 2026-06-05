package com.example.eldercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.eldercare.entity.Binding;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BindingMapper extends BaseMapper<Binding> {

    List<Binding> selectByGuardianId(@Param("guardianId") Long guardianId);

    List<Binding> selectByElderlyId(@Param("elderlyId") Long elderlyId);

    List<Binding> selectAcceptedByGuardianId(@Param("guardianId") Long guardianId);

    List<Binding> selectAcceptedByElderlyId(@Param("elderlyId") Long elderlyId);

    Binding selectByGuardianAndElderly(@Param("guardianId") Long guardianId, @Param("elderlyId") Long elderlyId);
}