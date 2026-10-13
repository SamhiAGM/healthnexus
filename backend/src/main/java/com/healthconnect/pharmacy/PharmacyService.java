package com.healthconnect.pharmacy;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class PharmacyService {

    private final PrescriptionRepository prescriptionRepository;
    private final MedicationStockRepository stockRepository;

    public PharmacyService(PrescriptionRepository prescriptionRepository, MedicationStockRepository stockRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.stockRepository = stockRepository;
    }

    public List<Prescription> getPrescriptions(String facilityId) {
        String safeFacility = (facilityId != null && !facilityId.isBlank()) ? facilityId : "NHSL";
        List<Prescription> existing = prescriptionRepository.findByFacilityIdOrderByCreatedAtDesc(safeFacility);
        if (existing.isEmpty() && prescriptionRepository.count() == 0) {
            initSeedPrescriptions(safeFacility);
            return prescriptionRepository.findByFacilityIdOrderByCreatedAtDesc(safeFacility);
        }
        return existing;
    }

    public Prescription dispensePrescription(String idOrNumber, String pharmacistName) {
        Prescription prescription = prescriptionRepository.findById(idOrNumber)
                .or(() -> prescriptionRepository.findByPrescriptionNumber(idOrNumber))
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found: " + idOrNumber));

        prescription.setStatus("DISPENSED");
        prescription.setDispensedBy(pharmacistName != null ? pharmacistName : "Chief Pharmacist");
        prescription.setDispensedAt(Instant.now());
        prescription.setUpdatedAt(Instant.now());

        return prescriptionRepository.save(prescription);
    }

    public List<MedicationStock> getInventory(String facilityId) {
        String safeFacility = (facilityId != null && !facilityId.isBlank()) ? facilityId : "NHSL";
        List<MedicationStock> existing = stockRepository.findByFacilityId(safeFacility);
        if (existing.isEmpty() && stockRepository.count() == 0) {
            initSeedInventory(safeFacility);
            return stockRepository.findByFacilityId(safeFacility);
        }
        return existing;
    }

    public MedicationStock adjustStock(String stockId, int quantityChange) {
        MedicationStock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Medication stock not found: " + stockId));

        stock.setStockUnits(Math.max(0, stock.getStockUnits() + quantityChange));
        return stockRepository.save(stock);
    }

    public Map<String, Object> getMetrics(String facilityId) {
        long pending = prescriptionRepository.countByStatus("PENDING");
        long dispensed = prescriptionRepository.countByStatus("DISPENSED");
        long totalStock = stockRepository.count();

        return Map.of(
                "pendingCount", pending,
                "dispensedCount", dispensed,
                "inventoryItemsCount", totalStock
        );
    }

    private void initSeedPrescriptions(String facilityId) {
        Prescription p1 = new Prescription(
                "RX-9041",
                "Kasun Chamara Perera",
                "1995*****678",
                "Dr. Samantha Senanayake, MBBS",
                List.of("Amlodipine 5mg - Daily morning (30 days)", "Atorvastatin 20mg - Daily night (30 days)"),
                "Take after meals with water."
        );
        p1.setFacilityId(facilityId);

        Prescription p2 = new Prescription(
                "RX-9042",
                "Nimali Rathnayake",
                "1974*****123",
                "Dr. Samantha Senanayake, MBBS",
                List.of("Metformin 500mg - Twice daily with food (60 days)", "Gliclazide 80mg - Morning before meal (30 days)"),
                "Monitor fasting blood glucose weekly."
        );
        p2.setFacilityId(facilityId);

        Prescription p3 = new Prescription(
                "RX-9043",
                "Dilan Weerasinghe",
                "1982*****456",
                "Dr. Priyantha Alwis, MD",
                List.of("Amoxicillin 500mg - 8 hourly (5 days)", "Paracetamol 500mg - PRN for pain"),
                "Complete full antibiotic course."
        );
        p3.setFacilityId(facilityId);
        p3.setStatus("DISPENSED");
        p3.setDispensedBy("P. Jayasuriya, B.Pharm");
        p3.setDispensedAt(Instant.now().minusSeconds(3600));

        prescriptionRepository.saveAll(List.of(p1, p2, p3));
    }

    private void initSeedInventory(String facilityId) {
        MedicationStock m1 = new MedicationStock("Amlodipine Besylate", "5mg Tabs", 1450, 200, "BATCH-AML-2026A", "12/2027");
        m1.setFacilityId(facilityId);
        MedicationStock m2 = new MedicationStock("Metformin Hydrochloride", "500mg Tabs", 2800, 500, "BATCH-MET-2026C", "09/2027");
        m2.setFacilityId(facilityId);
        MedicationStock m3 = new MedicationStock("Atorvastatin Calcium", "20mg Tabs", 920, 150, "BATCH-ATO-2026B", "11/2027");
        m3.setFacilityId(facilityId);
        MedicationStock m4 = new MedicationStock("Amoxicillin Trihydrate", "500mg Caps", 480, 200, "BATCH-AMX-2026D", "06/2027");
        m4.setFacilityId(facilityId);
        MedicationStock m5 = new MedicationStock("Salbutamol Inhaler", "100mcg/dose", 110, 50, "BATCH-SLB-2026E", "04/2027");
        m5.setFacilityId(facilityId);
        MedicationStock m6 = new MedicationStock("Paracetamol", "500mg Tabs", 8400, 1000, "BATCH-PCM-2026F", "01/2028");
        m6.setFacilityId(facilityId);

        stockRepository.saveAll(List.of(m1, m2, m3, m4, m5, m6));
    }
}
