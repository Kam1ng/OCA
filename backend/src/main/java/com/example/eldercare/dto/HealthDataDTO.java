package com.example.eldercare.dto;

public class HealthDataDTO {
    private Long elderlyId;
    private Integer heartRate;
    private Integer systolicPressure;
    private Integer diastolicPressure;
    private Double temperature;
    private Integer sleepStatus;
    private Double sleepDuration;
    private Integer source;
    private java.time.LocalDateTime recordTime;
    private Integer steps;

    public HealthDataDTO() {}

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
    
    public Integer getSource() { return source; }
    public void setSource(Integer source) { this.source = source; }
    
    public java.time.LocalDateTime getRecordTime() { return recordTime; }
    public void setRecordTime(java.time.LocalDateTime recordTime) { this.recordTime = recordTime; }
    
    public Integer getSteps() { return steps; }
    public void setSteps(Integer steps) { this.steps = steps; }
}