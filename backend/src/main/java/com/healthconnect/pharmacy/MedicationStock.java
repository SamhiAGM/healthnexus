package com.healthconnect.pharmacy;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "medication_inventory")
public class MedicationStock {

    @Id
    private String id;

    private String medicationName;
    private String dosage;
    private int stockUnits;
    private int minimumThreshold;
    private String batchNumber;
    private String expiryDate;
    private String facilityId = "NHSL";

    public MedicationStock() {}

    public MedicationStock(String medicationName, String dosage, int stockUnits, int minimumThreshold, String batchNumber, String expiryDate) {
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.stockUnits = stockUnits;
        this.minimumThreshold = minimumThreshold;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public int getStockUnits() { return stockUnits; }
    public void setStockUnits(int stockUnits) { this.stockUnits = stockUnits; }

    public int getMinimumThreshold() { return minimumThreshold; }
    public void setMinimumThreshold(int minimumThreshold) { this.minimumThreshold = minimumThreshold; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }
}
