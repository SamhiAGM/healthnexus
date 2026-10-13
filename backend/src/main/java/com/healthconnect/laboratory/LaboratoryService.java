package com.healthconnect.laboratory;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class LaboratoryService {

    private final LabOrderRepository labOrderRepository;

    public LaboratoryService(LabOrderRepository labOrderRepository) {
        this.labOrderRepository = labOrderRepository;
    }

    public List<LabOrder> getLabOrders(String facilityId) {
        String safeFacility = (facilityId != null && !facilityId.isBlank()) ? facilityId : "NHSL";
        List<LabOrder> existing = labOrderRepository.findByFacilityIdOrderByCreatedAtDesc(safeFacility);
        if (existing.isEmpty() && labOrderRepository.count() == 0) {
            initSeedLabOrders(safeFacility);
            return labOrderRepository.findByFacilityIdOrderByCreatedAtDesc(safeFacility);
        }
        return existing;
    }

    public LabOrder collectSample(String idOrNumber) {
        LabOrder order = labOrderRepository.findById(idOrNumber)
                .or(() -> labOrderRepository.findByOrderNumber(idOrNumber))
                .orElseThrow(() -> new IllegalArgumentException("Lab order not found: " + idOrNumber));

        order.setStatus("SAMPLE_COLLECTED");
        order.setUpdatedAt(Instant.now());
        return labOrderRepository.save(order);
    }

    public LabOrder recordResults(String idOrNumber, String results, String techName) {
        LabOrder order = labOrderRepository.findById(idOrNumber)
                .or(() -> labOrderRepository.findByOrderNumber(idOrNumber))
                .orElseThrow(() -> new IllegalArgumentException("Lab order not found: " + idOrNumber));

        order.setResultsSummary(results);
        order.setStatus("RELEASED");
        order.setTechnicianName(techName != null ? techName : "T. Mendis, MLT");
        order.setReleasedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        return labOrderRepository.save(order);
    }

    public Map<String, Object> getMetrics(String facilityId) {
        long ordered = labOrderRepository.countByStatus("ORDERED");
        long collected = labOrderRepository.countByStatus("SAMPLE_COLLECTED");
        long released = labOrderRepository.countByStatus("RELEASED");

        return Map.of(
                "orderedCount", ordered,
                "collectedCount", collected,
                "releasedCount", released,
                "totalCount", labOrderRepository.count()
        );
    }

    private void initSeedLabOrders(String facilityId) {
        LabOrder o1 = new LabOrder(
                "LAB-8812",
                "Kasun Chamara Perera",
                "1995*****678",
                "Dr. Samantha Senanayake, MBBS",
                "Lipid Profile & Serum Cholesterol",
                "Total Chol < 200 mg/dL, HDL > 40 mg/dL, LDL < 100 mg/dL"
        );
        o1.setFacilityId(facilityId);

        LabOrder o2 = new LabOrder(
                "LAB-8813",
                "Nimali Rathnayake",
                "1974*****123",
                "Dr. Samantha Senanayake, MBBS",
                "Fasting Blood Sugar (FBS) & HbA1c",
                "FBS: 70 - 99 mg/dL, HbA1c: < 5.7%"
        );
        o2.setFacilityId(facilityId);
        o2.setStatus("SAMPLE_COLLECTED");

        LabOrder o3 = new LabOrder(
                "LAB-8814",
                "Dilan Weerasinghe",
                "1982*****456",
                "Dr. Priyantha Alwis, MD",
                "Full Blood Count (FBC)",
                "WBC: 4.0 - 11.0 x10^9/L, Hb: 13.0 - 17.0 g/dL"
        );
        o3.setFacilityId(facilityId);
        o3.setStatus("RELEASED");
        o3.setResultsSummary("Hb: 14.2 g/dL (Normal), WBC: 7.4 x10^9/L, Platelets: 265 x10^9/L");
        o3.setTechnicianName("T. Mendis, MLT");
        o3.setReleasedAt(Instant.now().minusSeconds(7200));

        labOrderRepository.saveAll(List.of(o1, o2, o3));
    }
}
