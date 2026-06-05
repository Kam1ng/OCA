package com.example.eldercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@TableName("binding")
public class Binding {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("guardian_id")
    private Long guardianId;

    @TableField("elderly_id")
    private Long elderlyId;

    @TableField("status")
    private Integer status;

    @TableField("invite_code")
    private String inviteCode;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField("deleted")
    private Integer deleted;

    public static final Integer STATUS_PENDING = 0;
    public static final Integer STATUS_ACCEPTED = 1;
    public static final Integer STATUS_REJECTED = 2;

    public Binding() {}

    public Binding(Long id, Long guardianId, Long elderlyId, Integer status, String inviteCode, 
                   LocalDateTime createdAt, LocalDateTime updatedAt, Integer deleted) {
        this.id = id;
        this.guardianId = guardianId;
        this.elderlyId = elderlyId;
        this.status = status;
        this.inviteCode = inviteCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deleted = deleted;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGuardianId() {
        return guardianId;
    }

    public void setGuardianId(Long guardianId) {
        this.guardianId = guardianId;
    }

    public Long getElderlyId() {
        return elderlyId;
    }

    public void setElderlyId(Long elderlyId) {
        this.elderlyId = elderlyId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
}