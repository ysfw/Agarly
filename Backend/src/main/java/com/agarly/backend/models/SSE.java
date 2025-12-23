package com.agarly.backend.models;

import lombok.Data;

import java.util.List;

@Data
public class SSE {
    private String type;
    private List<String> to;
    private Object data; // Optional payload (can be item, booking, etc.)

    public SSE(String type, List<String> to) {
        this.type = type;
        this.to = to;
        this.data = null;
    }

    public SSE(String type, List<String> to, Object data) {
        this.type = type;
        this.to = to;
        this.data = data;
    }
}
