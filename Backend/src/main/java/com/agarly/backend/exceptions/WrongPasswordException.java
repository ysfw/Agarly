package com.agarly.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// This annotation is a backup; the GlobalExceptionHandler will take precedence
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class WrongPasswordException extends RuntimeException{

    public WrongPasswordException(String message) {
        super(message);
    }
}
