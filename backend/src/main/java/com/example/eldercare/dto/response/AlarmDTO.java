package com.example.eldercare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmDTO {
    private Long id;
    private String alarmType;
    private String content;
    private String elderlyName;
    private LocalDateTime createTime;
    private String status;
}