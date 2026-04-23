package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.response.NotificationResponse;
import com.smcsystem.smart_campus_system.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void send(String userId, String title, String message, NotificationType type, String referenceId);
    List<NotificationResponse> getMyNotifications();
    void markAsRead(String notificationId);
    void markAllAsRead();
}
