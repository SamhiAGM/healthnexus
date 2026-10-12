package com.healthconnect.hospitaladmin;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "hospital_departments")
public class HospitalDepartment {

    @Id
    private String id;
    private String name;
    private String code;
    private String headOfDepartment;
    private int totalStaff;
    private int bedCapacity;
    private int occupiedBeds;
    private String status = "OPERATIONAL"; // OPERATIONAL, HIGH_DEMAND, UNDER_MAINTENANCE

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public HospitalDepartment() {}

    public HospitalDepartment(String name, String code, String headOfDepartment, int totalStaff, int bedCapacity, int occupiedBeds, String status) {
        this.name = name;
        this.code = code;
        this.headOfDepartment = headOfDepartment;
        this.totalStaff = totalStaff;
        this.bedCapacity = bedCapacity;
        this.occupiedBeds = occupiedBeds;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getHeadOfDepartment() { return headOfDepartment; }
    public void setHeadOfDepartment(String headOfDepartment) { this.headOfDepartment = headOfDepartment; }

    public int getTotalStaff() { return totalStaff; }
    public void setTotalStaff(int totalStaff) { this.totalStaff = totalStaff; }

    public int getBedCapacity() { return bedCapacity; }
    public void setBedCapacity(int bedCapacity) { this.bedCapacity = bedCapacity; }

    public int getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(int occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
