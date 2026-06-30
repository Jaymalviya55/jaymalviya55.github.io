---
description: Filtered Excel generation -- when user need to get filtered data excel
---

# /excel-filter - Implement Filtered Excel Export

$ARGUMENTS

---

## Task

This workflow orchestrates the end-to-end implementation of a dynamic Excel export feature, where the downloaded Excel file exactly matches the active filters applied to a frontend PrimeReact DataTable.

### Steps:

1. **Request Analysis & Planning**
   - Use `project-planner` to identify the target entity and existing backend infrastructure.
   - Ensure you understand which grid component requires the export feature.

2. **Frontend Implementation (React/PrimeReact)**
   - Use `frontend-specialist` to:
     - Intercept PrimeReact's `onFilter` events and store `DataTableFilterMeta` state.
     - Create a mapper to convert the filter metadata into a backend-friendly JSON DTO.
     - Update the "Export to Excel" button to send a POST request with the filter payload.
     - Handle the incoming `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` binary blob to trigger a native browser download.

3. **API & Application Layer (.NET Backend)**
   - Use `backend-specialist` to:
     - Create an `ExcelExportRequestDto` to capture incoming dynamic filter data.
     - Implement an `ExportToExcel` endpoint (POST recommended).
     - Define a CQRS Query handler (e.g., `ExportEntityToExcelQuery`).
     - Build a dynamic query parser that translates the DTO into Entity Framework Core `IQueryable` Where clauses.

4. **Infrastructure Layer (Excel Generation)**
   - Use `backend-specialist` to:
     - Inject an Excel generation service (using ClosedXML or EPPlus).
     - Stream the dynamically filtered `IQueryable` data into the Excel workbook to avoid high memory overhead.

5. **Verification & Testing**
   - Use `test-engineer` to verify that the DTO structure matches between frontend and backend.
   - Ensure the generated file is formatted correctly.

---

## Usage Examples

```
/excel-filter StudentsGrid
/excel-filter EmployeeReports
/excel-filter
```

---

## Before Starting

If the request is unclear, ask:
- Which specific PrimeReact grid or entity are we targeting?
- Do you have a preference between ClosedXML and EPPlus for the backend library?
- Are there any complex filter types (like dates or custom dropdowns) that need special parsing?

Use default best practices if not explicitly specified.