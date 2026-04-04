package com.aicodementor.model;

import lombok.Data;

@Data
public class ExecutionResponse {
    private String output;
    private String error;
    private Boolean isError;
}
