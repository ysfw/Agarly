package com.agarly.backend.models;

import lombok.Data;

@Data
public class StatusResponse {
    public StatusResponse(String status) {
        this.status = status;
    }

    private String status;
}
