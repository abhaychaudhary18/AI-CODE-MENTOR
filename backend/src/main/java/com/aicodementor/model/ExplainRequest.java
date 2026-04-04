package com.aicodementor.model;

import lombok.Data;

@Data
public class ExplainRequest {
    private String language;
    private String code;
    private String output;
    private String error;
}
