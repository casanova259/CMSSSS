import * as XLSX from "xlsx";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;
const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "N/A";

const applyHeaderStyle = (ws, headerRow) => {
  headerRow.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } },
      },
    };
  });
};

const autoFitColumns = (data) => {
  if (!data.length) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => ({
    wch:
      Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length),
      ) + 2,
  }));
};

// ── Sheet Builders ────────────────────────────────────────────────────────────

const buildAllStudentsSheet = (students, fees) => {
  const headers = [
    "#",
    "Full Name",
    "Roll No",
    "University Roll No",
    "Department",
    "Year",
    "Semester",
    "Email",
    "Phone",
    "Hostel Room",
    "DRCC",
    "Bank Name",
    "Account No",
    "IFSC Code",
    "Total Fees (₹)",
    "Paid (₹)",
    "Unpaid (₹)",
    "Fee Status",
  ];

  const rows = students.map((s, i) => {
    const studentFees = fees.filter((f) => f.studentId === s.id);
    const totalPaid = studentFees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const totalUnpaid = studentFees
      .filter((f) => f.status === "unpaid")
      .reduce((sum, f) => sum + Number(f.amount), 0);
    const total = totalPaid + totalUnpaid;
    return {
      "#": i + 1,
      "Full Name": s.fullName,
      "Roll No": s.rollNo,
      "University Roll No": s.uniRollNo,
      Department: s.department,
      Year: s.year,
      Semester: s.semester,
      Email: s.email,
      Phone: s.phone || "N/A",
      "Hostel Room": s.hostelRoom || "Day Scholar",
      DRCC: s.isDRCC ? "Yes" : "No",
      "Bank Name": s.bankName || "N/A",
      "Account No": s.bankAccount || "N/A",
      "IFSC Code": s.ifscCode || "N/A",
      "Total Fees (₹)": total,
      "Paid (₹)": totalPaid,
      "Unpaid (₹)": totalUnpaid,
      "Fee Status": totalUnpaid > 0 ? "Unpaid" : "Paid",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  ws["!cols"] = autoFitColumns(rows);
  applyHeaderStyle(ws, headers);
  return ws;
};

const buildPaidStudentsSheet = (students, fees) => {
  const headers = [
    "#",
    "Full Name",
    "Roll No",
    "University Roll No",
    "Department",
    "Year",
    "Fee Type",
    "Amount (₹)",
    "Semester",
    "Academic Year",
    "Paid Date",
    "Payment Mode",
    "Transaction ID",
    "Receipt No",
  ];

  const rows = [];
  let idx = 1;
  students.forEach((s) => {
    const paidFees = fees.filter(
      (f) => f.studentId === s.id && f.status === "paid",
    );
    paidFees.forEach((fee) => {
      rows.push({
        "#": idx++,
        "Full Name": s.fullName,
        "Roll No": s.rollNo,
        "University Roll No": s.uniRollNo,
        Department: s.department,
        Year: s.year,
        "Fee Type": fee.feeType,
        "Amount (₹)": Number(fee.amount),
        Semester: fee.semester,
        "Academic Year": fee.academicYear,
        "Paid Date": formatDate(fee.paidDate),
        "Payment Mode": fee.paymentMode || "N/A",
        "Transaction ID": fee.transactionId || "N/A",
        "Receipt No": fee.receiptNo || "N/A",
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  ws["!cols"] = autoFitColumns(rows);
  applyHeaderStyle(ws, headers);
  return ws;
};

const buildUnpaidStudentsSheet = (students, fees) => {
  const headers = [
    "#",
    "Full Name",
    "Roll No",
    "University Roll No",
    "Department",
    "Year",
    "Email",
    "Phone",
    "Fee Type",
    "Amount Due (₹)",
    "Semester",
    "Academic Year",
    "Due Date",
    "Overdue",
    "Remarks",
  ];

  const rows = [];
  let idx = 1;
  students.forEach((s) => {
    const unpaidFees = fees.filter(
      (f) => f.studentId === s.id && f.status === "unpaid",
    );
    unpaidFees.forEach((fee) => {
      const isOverdue = fee.dueDate && new Date(fee.dueDate) < new Date();
      rows.push({
        "#": idx++,
        "Full Name": s.fullName,
        "Roll No": s.rollNo,
        "University Roll No": s.uniRollNo,
        Department: s.department,
        Year: s.year,
        Email: s.email,
        Phone: s.phone || "N/A",
        "Fee Type": fee.feeType,
        "Amount Due (₹)": Number(fee.amount),
        Semester: fee.semester,
        "Academic Year": fee.academicYear,
        "Due Date": formatDate(fee.dueDate),
        Overdue: isOverdue ? "YES ⚠️" : "No",
        Remarks: fee.remarks || "",
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  ws["!cols"] = autoFitColumns(rows);
  applyHeaderStyle(ws, headers);
  return ws;
};

const buildSummarySheet = (students, fees) => {
  const totalStudents = students.length;
  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const totalUnpaid = fees
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const studentsWithUnpaid = [
    ...new Set(
      fees.filter((f) => f.status === "unpaid").map((f) => f.studentId),
    ),
  ].length;
  const studentsFullyPaid = totalStudents - studentsWithUnpaid;

  const deptBreakdown = {};
  students.forEach((s) => {
    if (!deptBreakdown[s.department])
      deptBreakdown[s.department] = { students: 0, paid: 0, unpaid: 0 };
    deptBreakdown[s.department].students++;
    fees
      .filter((f) => f.studentId === s.id)
      .forEach((f) => {
        if (f.status === "paid")
          deptBreakdown[s.department].paid += Number(f.amount);
        else deptBreakdown[s.department].unpaid += Number(f.amount);
      });
  });

  const summaryData = [
    {
      Metric: "Report Generated On",
      Value: new Date().toLocaleString("en-IN"),
    },
    { Metric: "", Value: "" },
    { Metric: "── STUDENT SUMMARY ──", Value: "" },
    { Metric: "Total Students", Value: totalStudents },
    { Metric: "Students with All Fees Paid", Value: studentsFullyPaid },
    { Metric: "Students with Pending Fees", Value: studentsWithUnpaid },
    { Metric: "", Value: "" },
    { Metric: "── FEE SUMMARY ──", Value: "" },
    { Metric: "Total Fees Billed", Value: formatCurrency(totalFees) },
    { Metric: "Total Fees Collected", Value: formatCurrency(totalPaid) },
    { Metric: "Total Fees Pending", Value: formatCurrency(totalUnpaid) },
    {
      Metric: "Collection Rate",
      Value: `${((totalPaid / totalFees) * 100).toFixed(1)}%`,
    },
    { Metric: "", Value: "" },
    { Metric: "── DEPARTMENT BREAKDOWN ──", Value: "" },
    ...Object.entries(deptBreakdown).map(([dept, data]) => ({
      Metric: `${dept} — ${data.students} students`,
      Value: `Paid: ${formatCurrency(data.paid)} | Unpaid: ${formatCurrency(data.unpaid)}`,
    })),
  ];

  const ws = XLSX.utils.json_to_sheet(summaryData, {
    header: ["Metric", "Value"],
  });
  ws["!cols"] = [{ wch: 40 }, { wch: 45 }];
  applyHeaderStyle(ws, ["Metric", "Value"]);
  return ws;
};

// ── Main Export Function ──────────────────────────────────────────────────────

export const exportStudentsToExcel = (students, fees, type = "all") => {
  const wb = XLSX.utils.book_new();
  const date = new Date().toISOString().split("T")[0];

  if (type === "all" || type === "full") {
    XLSX.utils.book_append_sheet(
      wb,
      buildSummarySheet(students, fees),
      "📊 Summary",
    );
    XLSX.utils.book_append_sheet(
      wb,
      buildAllStudentsSheet(students, fees),
      "👥 All Students",
    );
    XLSX.utils.book_append_sheet(
      wb,
      buildPaidStudentsSheet(students, fees),
      "✅ Paid Fees",
    );
    XLSX.utils.book_append_sheet(
      wb,
      buildUnpaidStudentsSheet(students, fees),
      "❌ Unpaid Fees",
    );
    XLSX.writeFile(wb, `College_Fee_Report_${date}.xlsx`);
  } else if (type === "paid") {
    XLSX.utils.book_append_sheet(
      wb,
      buildPaidStudentsSheet(students, fees),
      "✅ Paid Students",
    );
    XLSX.writeFile(wb, `Paid_Students_${date}.xlsx`);
  } else if (type === "unpaid") {
    XLSX.utils.book_append_sheet(
      wb,
      buildUnpaidStudentsSheet(students, fees),
      "❌ Unpaid Students",
    );
    XLSX.writeFile(wb, `Unpaid_Students_${date}.xlsx`);
  } else if (type === "students") {
    XLSX.utils.book_append_sheet(
      wb,
      buildAllStudentsSheet(students, fees),
      "👥 All Students",
    );
    XLSX.writeFile(wb, `All_Students_${date}.xlsx`);
  }
};
