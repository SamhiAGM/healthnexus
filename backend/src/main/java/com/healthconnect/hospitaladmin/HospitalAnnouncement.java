package com.healthconnect.hospitaladmin;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "hospital_announcements")
public class HospitalAnnouncement {

    @Id
    private String id;
    private String title;
    private String content;
    private String department; // e.g. "ALL", "Cardiology", "Emergency"
    private String priority = "ROUTINE"; // ROUTINE, URGENT, CRITICAL
    private String authorName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public HospitalAnnouncement() {}

    public HospitalAnnouncement(String title, String content, String department, String priority, String authorName) {
        this.title = title;
        this.content = content;
        this.department = department;
        this.priority = priority;
        this.authorName = authorName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
