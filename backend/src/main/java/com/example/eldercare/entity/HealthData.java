package com.example.eldercare.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.time.LocalDateTime;

@TableName("health_data")
public class HealthData {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField("elderly_id")
    private Long elderlyId;
    
    @TableField("heart_rate")
    private Integer heartRate;
    
    @TableField("systolic_pressure")
    private Integer systolicPressure;
    
    @TableField("diastolic_pressure")
    private Integer diastolicPressure;
    
    @TableField("temperature")
    private Double temperature;
    
    @TableField("sleep_status")
    private Integer sleepStatus;
    
    @TableField("sleep_duration")
    private Double sleepDuration;
    
    @TableField("record_time")
    private LocalDateTime recordTime;
    
    @TableField("source")
    private Integer source;
    
    @TableField("steps")
    private Integer steps;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    public HealthData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getElderlyId() { return elderlyId; }
    public void setElderlyId(Long elderlyId) { this.elderlyId = elderlyId; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getSystolicPressure() { return systolicPressure; }
    public void setSystolicPressure(Integer systolicPressure) { this.systolicPressure = systolicPressure; }

    public Integer getDiastolicPressure() { return diastolicPressure; }
    public void setDiastolicPressure(Integer diastolicPressure) { this.diastolicPressure = diastolicPressure; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Integer getSleepStatus() { return sleepStatus; }
    public void setSleepStatus(Integer sleepStatus) { this.sleepStatus = sleepStatus; }

    public Double getSleepDuration() { return sleepDuration; }
    public void setSleepDuration(Double sleepDuration) { this.sleepDuration = sleepDuration; }

    public LocalDateTime getRecordTime() { return recordTime; }
    public void setRecordTime(LocalDateTime recordTime) { this.recordTime = recordTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Integer getSource() { return source; }
    public void setSource(Integer source) { this.source = source; }
    
    public Integer getSteps() { return steps; }
    public void setSteps(Integer steps) { this.steps = steps; }
}