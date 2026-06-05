package com.example.eldercare.dto;

public class BindResponseDTO {
    private Long id;
    private Long guardianId;
    private Long elderlyId;
    private Integer status;
    private String inviteCode;

    public BindResponseDTO() {}

    public BindResponseDTO(Long id, Long guardianId, Long elderlyId, Integer status, String inviteCode) {
        this.id = id;
        this.guardianId = guardianId;
        this.elderlyId = elderlyId;
        this.status = status;
        this.inviteCode = inviteCode;
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
}