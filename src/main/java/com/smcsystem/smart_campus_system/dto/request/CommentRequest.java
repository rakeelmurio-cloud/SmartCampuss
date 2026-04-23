package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment is required")
    private String comment;
}
